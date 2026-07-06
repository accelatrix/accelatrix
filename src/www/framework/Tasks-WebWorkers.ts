/// <reference path="./Base.ts" />
/// <reference path="./Enumerable.ts" />

// This is the code that runs in Web Workers
import { Accelatrix as Accelatrix_Base } from "./Base"
import { Accelatrix as Accelatrix_Globalization } from "./Globalization";
import { Accelatrix as Accelatrix_Serialization } from "./Serialization"
import { Accelatrix as Accelatrix_Tasks } from "./Tasks"
import { Accelatrix as Accelatrix_Enumerable } from "./Enumerable"
import { Accelatrix as Accelatrix_Type } from "./Type"

namespace AccelatrixWebWorker
{
    let isWebWorker = !String.IsNullOrWhiteSpace(self["__WebWorkerScripts__"]);
    var isWorking = false;
    var interimResultFromWorkloadStream = undefined;
    export var outstandingAbort: () => {} = null;

    if (isWebWorker)
    {                
        var postWorkloadCleanUp = () => {}

        self.addEventListener("message", function(e)
        {
            //----- Abort any ongoing work ----------------
            if (e.data == "Abort")
            {
                Abort();
                return;
            }

            //----- Receive work ----------------
            if (typeof e.data == "string")
            {
                if (e.data.indexOf('"$type":"WebWorkerUtil.Workload"') >= 0)
                {
                    let message: any;

                    try
                    {
                        message = Accelatrix_Serialization.Serialization.FromJSON(e.data);
                        //self["PendingMsg"] = "Workload received (s) #" + self["__WebWorkerId__"] + " " + Date.now().toString();
                    }
                    catch(ex)
                    {
                        isWorking = false;
                        interimResultFromWorkloadStream = undefined;
                        throw ex;
                    }
        
                    let messageType = message.GetType();
        
                    if (messageType.Name == "Workload")
                        WorkloadReceived(message as WebWorkerUtil.Workload, postWorkloadCleanUp);
    
                    return;
                }
            }
            else
            {
                var type = e.data.GetType();
                //self["PendingMsg"] = "Workload received (c) #" + self["__WebWorkerId__"] + " " + Date.now().toString();
                if (type.Name == "Workload" || type.Alias == "WebWorkerUtil.Workload")
                    WorkloadReceived(e.data as WebWorkerUtil.Workload, postWorkloadCleanUp);
                else if (type.Name == "PackagedWorkload" || type.Alias == "WebWorkerUtil.PackagedWorkload")
                    WorkloadReceived(WebWorkerUtil.Workload.UnpackWorkload(e.data), postWorkloadCleanUp);                
            }
        });


        // ------------------------ Trap onMessage subscribers and release ---------------------------------
        var originalAddEventListener = self.addEventListener as Function;
        var onMessageSubscribers = [];
        postWorkloadCleanUp = () =>
        {
            onMessageSubscribers.ForEach(z => self.removeEventListener("message", z));
            onMessageSubscribers = [];
        };

        self.addEventListener = function(...args)
        {
            if (args[0] == "message")
                onMessageSubscribers.push(args[1]);

            originalAddEventListener.apply(self, args);
        };
        //----------------------------------------------------------------------------------------------
    }

    function WorkloadReceived(workload: WebWorkerUtil.Workload, cleanUpAtEnd: () => void)
    {
        isWorking = true;

        Accelatrix_Tasks.Tasks.Config.MaxParallelism = workload.MaxParallelismForChildren;

        if (workload.Culture != null)
            Accelatrix_Globalization.Globalization.DefaultFormatting = workload.Culture;

        WebWorkerUtil.WorkOnSequenceOfActivities(workload.ChainOfActions as any, interimResultFromWorkloadStream === undefined ? workload.InputArguments : [interimResultFromWorkloadStream], (result, ex) =>
        {         
            outstandingAbort = null;
            isWorking = !workload.ReturnResult || ex != null;

            interimResultFromWorkloadStream = workload.ReturnResult || ex != null
                                              ? undefined
                                              : result;

            if (ex != null)
            {
                cleanUpAtEnd(); 
                setTimeout(() => { throw ex }, 0);
                return;
            }                

            let workloadResult = workload.ReturnResult
                                 ? new WebWorkerUtil.WorkloadResult(result)
                                 : new WebWorkerUtil.WorkloadResult(undefined, true);

            //console.log("worker #" + self["__WebWorkerId__"]);

            cleanUpAtEnd();

            if (workload.DataPassingMethod == Accelatrix_Tasks.Tasks.DataPassingMethod.Clone)
            {
                //var log = self["PendingMsg"] + ", sent " + Date.now().toString();
                self.postMessage(workloadResult, null);                
                //setTimeout(() => console.log(log), 15000);
            }                
            else
            {
                let msg = Accelatrix_Serialization.Serialization.ToJSON(workloadResult);
                //var log = self["PendingMsg"] + ", sent " + Date.now().toString();
                self.postMessage(msg, null);                
                //setTimeout(() => console.log(log), 2000);
            }                
        });
    }

    function Abort()
    {
        interimResultFromWorkloadStream = undefined;

        if (outstandingAbort != null)
        {
            try
            {
                outstandingAbort();
            }
            catch(ex)
            {}
        }

        if (!isWorking) return;
        
        Accelatrix_Tasks.Tasks.Task.CancelAll();
    }
}


export namespace WebWorkerUtil
{
    let isWebWorker = !String.IsNullOrWhiteSpace(self["__WebWorkerScripts__"]);

    export function WorkOnSequenceOfActivities(activities: Accelatrix_Enumerable.Collections.IEnumerableOps<Accelatrix_Tasks.Tasks.TaskActivity<any, any>>, inputArgs: any[], callback: (result: any, exception: any) => void )
    {
        try
        {
            AccelatrixWebWorker.outstandingAbort = null;

            if (activities == null) // failsafe
            {
                callback(inputArgs == null || inputArgs.length == 0 ? null : inputArgs[0], null);
                return ;
            }

            activities = activities.Freeze();

            var handleResult = (r, e) =>
            {
                if (e != null)
                {
                    callback(null, e);
                    return;
                }

                if (IsWrappedResult(r))
                {
                    WorkOnSequenceOfActivities([r].Concat(activities), null, callback);
                    return;
                }

                if (activities == null || !activities.Any()) // end
                {
                    if (r instanceof Function) // final unwrapping of functions
                        WorkOnSequenceOfActivities([r], null, callback);
                    else
                        callback(r, null);
                }
                else
                {
                    WorkOnSequenceOfActivities(activities, [r], callback);
                }
            }
                
            let activity = activities.FirstOrNull();

            if (activity == null)
            {   
                WorkOnSequenceOfActivities(null, inputArgs, callback);
                return;
            }

            if (IsPromise(activity)) // Promise
            {
                var temp = Date.now();

                activity["catch"](e =>
                                 {
                                     handleResult(null, e);
                                 });

                activity["then"](r =>
                                {
                                    handleResult(r, null);
                                });                        
                                
                if (activity["cancel"] != null && activity["cancel"] instanceof Function)
                    AccelatrixWebWorker.outstandingAbort = activity["cancel"];
                else if (activity["Cancel"] != null && activity["Cancel"] instanceof Function)
                    AccelatrixWebWorker.outstandingAbort = activity["Cancel"];
            }
            else if (IsTask(activity) && (activity as Accelatrix_Tasks.Tasks.ITask<any, any>).Status != Accelatrix_Tasks.Tasks.TaskStatus.WaitingToRun && (activity as Accelatrix_Tasks.Tasks.ITask<any, any>).Status != Accelatrix_Tasks.Tasks.TaskStatus.Running)
            {
                let task = activity as Accelatrix_Tasks.Tasks.ITask<any, any>;

                if (task.IsCancelled || task.IsFaulted)
                    handleResult(null, task.Exception);
                else if (task.IsCompleted)
                    handleResult(task.Result, null);
                else if (Accelatrix_Tasks.Tasks.Config.MaxParallelism <= 0 || isWebWorker) // Does not make sense so spawn subtasls. However, functions that spawn subworkers will work, e.g. (result) => Accelatrix.Tasks.Task.StartNew(x => x.Select(w => w / 3).ToList() , result)
                {
                    WorkOnSequenceOfActivities(task.Activities.Actions.Concat(activities),
                                            inputArgs == null || !inputArgs.Any() ? task.Activities.InputArguments : inputArgs,
                                            callback);
                }
                else
                {
                    try
                    {
                        if (inputArgs != null && inputArgs.Any())
                            task.Activities.InputArguments = inputArgs;

                        task.Start().Finally(t => handleResult(t.Result, t.Exception));
                        AccelatrixWebWorker.outstandingAbort = task.Cancel;
                    }
                    catch(ex)
                    {
                        handleResult(null, ex);
                    }
                }            
            }
            else if (IsAwaitable(activity))
            {
                let promise = activity["GetAwaiter"]();

                promise["catch"](e =>
                                {
                                handleResult(null, e);
                                });

                promise["then"](r =>
                                {
                                handleResult(r, null);
                                });                           
                                
                if (promise["cancel"] != null && promise["cancel"] instanceof Function)
                    AccelatrixWebWorker.outstandingAbort = promise["cancel"];
                else if (promise["Cancel"] != null && promise["Cancel"] instanceof Function)
                    AccelatrixWebWorker.outstandingAbort = promise["Cancel"];                             
            }        
            else if (activity instanceof Function)
            {
                try
                {
                    var fResult = (activity as Function).apply(null, inputArgs == null
                                                                     ? null
                                                                     : inputArgs.Any == null 
                                                                        ? [inputArgs]
                                                                        : !inputArgs.Any()
                                                                            ? null
                                                                            : inputArgs);

                    handleResult(fResult, null);
                }
                catch(ex)
                {
                    handleResult(null, ex);
                }
            }
            else 
            {
                handleResult(activity, null);
            }

        }
        catch(unhandledException)
        {
            console.error(unhandledException); // stack overflow
            callback(null, unhandledException);            
        }        
    }

    /** Represents a linear set of actions to be processed in sequence. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.Workload")
    export class Workload
    {
        public constructor(chainOfActions: Array<Accelatrix_Tasks.Tasks.TaskActivity<any, any>>, inputArguments: Array<any>, returnResult: boolean, maxParallelismForChildren: number, dataPassingMethod: Accelatrix_Tasks.Tasks.DataPassingMethod,cultureChange: Accelatrix_Globalization.Globalization.ILocaleFormatInfo)
        {
            if (chainOfActions == null || !chainOfActions.Any())
                throw new Accelatrix_Base.ArgumentNullException("chainOfActions");

            let myActions = chainOfActions.ToList();

            myActions.Where(z => IsTask(z))
                     .Select(z => z as Accelatrix_Tasks.Tasks.ITask<any, any>)
                     .Where(z => z.Status == Accelatrix_Tasks.Tasks.TaskStatus.Running || z.Status == Accelatrix_Tasks.Tasks.TaskStatus.WaitingToRun)
                     .Take(1)
                     .ForEach(z =>
                     {
                        throw new Accelatrix_Tasks.Tasks.TaskException("Cannot process a task that is already in the execution queue.");
                     });

            Object.defineProperty(this, "ChainOfActions", { get: () => myActions, enumerable: true });
            Object.defineProperty(this, "InputArguments", { get: () => inputArguments == null ? [] : inputArguments, enumerable: true });
            Object.defineProperty(this, "MaxParallelismForChildren", { get: () => maxParallelismForChildren, enumerable: true });
            Object.defineProperty(this, "DataPassingMethod", { get: () => dataPassingMethod, enumerable: true });
            Object.defineProperty(this, "ReturnResult", { get: () => returnResult, enumerable: true });
            Object.defineProperty(this, "Culture", { get: () => cultureChange, enumerable: true });
        }

        /** Gets the chain of actions where the output of one is the input of the next, starting with the input arguments to be passed to the first action. */
        public get ChainOfActions(): Array<Function>
        {
            return null;
        }

        /** The maximum degree of parallelism allowed for child tasks. */
        public get MaxParallelismForChildren(): number
        {
            return 8;
        }

        public get DataPassingMethod(): Accelatrix_Tasks.Tasks.DataPassingMethod
        {
            return Accelatrix_Tasks.Tasks.DataPassingMethod.TypedSerialization;
        }

        /** An optional set of parameters to pass to the first function in the chain. */
        public get InputArguments(): Array<any>
        {
            return null;
        }

        public get Culture(): Accelatrix_Globalization.Globalization.ILocaleFormatInfo
        {
            return null;
        }

        public get ReturnResult(): boolean
        {
            return true;
        }

        /**
         * Packages the Workload instance as a message to be shared with a Web Worker.
         * It optimises the handling of data in enumerations.
         * @returns Returns the message to post to the Web Worker.
         */
        public AsMessage(): any
        {
            return PackagedWorkload.AsMessage(this);
        }

        public static UnpackWorkload(packagedWorkload: PackagedWorkload): Workload
        {
            return PackagedWorkload.UnpackWorkload(packagedWorkload);  
        }
    }

    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.PackagedWorkload")
    class PackagedWorkload
    {
        public constructor(workload: Workload)
        {   
            Object.defineProperty(this, "$type", { get: () => "WebWorkerUtil.PackagedWorkload", enumerable: true });

            var inputArgs = PackagedWorkload.PackageInputArguments(workload.InputArguments);

            if (workload.InputArguments != null)
                workload.InputArguments.splice(0, workload.InputArguments.length);
            
            Object.defineProperty(this, "Workload", { enumerable: true, get: () => Accelatrix_Serialization.Serialization.ToJSON(workload) });

            Object.defineProperty(this, "InputArguments", { enumerable: true, get: () => inputArgs });
        }

        /** Gets the serialised workload without arguments that can be cloned */
        public get Workload(): string
        {
            return null;
        }

        /** Gets the clonable input arguments. */
        public get InputArguments(): Array<any>
        {
            return null;
        }        

        private static PackageInputArguments(inputArgs: Array<any>)
        {
            if (inputArgs == null || !inputArgs.Any()) return inputArgs;

            return inputArgs.Select(z => PackagedWorkload.IsEnumerable(z)
                                         ? PackagedWorkload.PackageEnumerable(z)
                                         : PackagedWorkload.HasNonClonable(z)
                                           ? "JSON:" + Accelatrix_Serialization.Serialization.ToJSON(z)
                                           : z)
                            .ToList();
        }

        private static UnPackageInputArguments(inputArgs: Array<any>)
        {
            if (inputArgs == null || !inputArgs.Any()) return inputArgs;

            return inputArgs.Select(z => PackagedWorkload.IsEnumerable(z)
                                         ? PackagedWorkload.UnpackEnumerable(z)
                                         : z == null || !(typeof z == "string") || z.substring(0, 5) != "JSON:"
                                           ? z
                                           : Accelatrix_Serialization.Serialization.FromJSON(z.substring(5)))
                            .ToList();
        }

        private static HasNonClonable(obj: any)
        {
            return obj == null
                   ? false
                   : obj instanceof Function || obj instanceof RegExp
                     ? true
                     : obj instanceof Array
                       ? (obj as Array<any>).Where(z => PackagedWorkload.HasNonClonable(z)).Any()
                       : obj instanceof Boolean || typeof obj == "boolean" || obj instanceof String || typeof obj == "string" || obj instanceof Number || typeof obj == "number" || obj instanceof Date
                         ? false
                         : Object.keys(obj)
                                 .Select(z => obj[z])
                                 .Where(z => z != null)
                                 .Where(z => PackagedWorkload.HasNonClonable(z)).Any()
        }

        private static IsEnumerable(obj: any)
        {
            return obj == null
                   ? false
                   : obj.Any != null && obj.Any instanceof Function && !(obj instanceof Array) && obj["toJSON"] instanceof Function
                     ? true
                     : obj["$type"] != null && obj["$type"] == "EnumerableWrapper";
        }

        private static PackageEnumerable(obj: any)
        {
            if (obj == null) return obj;

            var description = obj.toJSON();
            
            if (description.Members.length == 0 || !(description.Members[0] instanceof Array))
                return "JSON:" + Accelatrix_Serialization.Serialization.ToJSON(obj);

            var data = description.Members[0];
            description.Members[0] = [];
            var enumerableType = description["$type"];
            delete description["$type"];
            return {
                      $type: "EnumerableWrapper",
                      Data: data,
                      Enumerable: Accelatrix_Serialization.Serialization.ToJSON(description),
                      EnumerableType: enumerableType
                   }
        }

        private static UnpackEnumerable(obj: any)
        {
            var data = obj.Data;
            var description = Accelatrix_Serialization.Serialization.FromJSON(obj.Enumerable) as any;
            description.Members[0] = data;
            description["$type"] = obj.EnumerableType;

            return Accelatrix_Serialization.Serialization.FromJSON(description as any);
        }
        public static AsMessage(workload: Workload): any
        {
            return workload.DataPassingMethod == Accelatrix_Tasks.Tasks.DataPassingMethod.TypedSerialization || workload.InputArguments == null || !workload.InputArguments.Any()
                   ? Accelatrix_Serialization.Serialization.ToJSON(workload)
                   : new PackagedWorkload(workload);
        }

        public static UnpackWorkload(packagedWorkload: PackagedWorkload): Workload
        {
            var result = Accelatrix_Serialization.Serialization.FromJSON(packagedWorkload.Workload) as Workload;
            var inputArgs = PackagedWorkload.UnPackageInputArguments(packagedWorkload.InputArguments)
            
            if (inputArgs != null)
                inputArgs.ForEach(z => result.InputArguments.push(z));

            return result;
        }
    }

    /** Represents a result. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.WorkloadResult")
    export class WorkloadResult
    {
        constructor(result: any, resultRetained?: boolean)
        {
            Object.defineProperty(this, "Result", { get: () => result, enumerable: true });
            Object.defineProperty(this, "ResultRetained", { get: () => resultRetained === true, enumerable: true });
        }

        /** Gets the result. */
        public get Result(): Object
        {
            return null;
        }

        /** Gets if the result was retained in the worker for follow-up activities. */
        public get ResultRetained(): boolean
        {
            return false;
        }        
    }

    /** A request issued by a StatefulActivity to write data to the base thread. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.StatefulActivityWriteRequest")
    export class StatefulActivityWriteRequest
    {
        constructor(id: string, data: any, append: boolean)
        {
            Object.defineProperty(this, "Id", { get: () => id, enumerable: true });
            Object.defineProperty(this, "Data", { get: () => data, enumerable: true });
            Object.defineProperty(this, "Append", { get: () => append, enumerable: true });
        }

        /** Gets the id of the StatefulActivity instance. */
        public get Id(): string
        {
            return null;
        }
        
        /** Gets the data to write. */
        public get Data(): any
        {
            return null;
        }

        /** If the data read is to be appended. */
        public get Append(): boolean
        {
            return null;
        }
    }

    /** A request issued by a StatefulActivity to read data from the base thread. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.StatefulActivityReadRequest")
    export class StatefulActivityReadRequest
    {
        constructor(id: string, requestId: string)
        constructor(id: string, requestId: string, transform: (data: any) => any)
        constructor(id: string, requestId: string, transform?: (data: any) => any)
        {
            Object.defineProperty(this, "Id", { get: () => id, enumerable: true });
            Object.defineProperty(this, "RequestId", { get: () => requestId, enumerable: true });
            Object.defineProperty(this, "Transform", { get: () => transform, enumerable: true });
        }

        /** Gets the id of the StatefulActivity instance. */
        public get Id(): string
        {
            return null;
        }
        
        /** Gets the id of the request. */
        public get RequestId(): string
        {
            return null;
        }

        /** If the data read is to be transformed into something else. */
        public get Transform(): (data: any) => any
        {
            return null;
        }
    }

    /** A request issued by a StatefulActivity to read data from the base thread and push additional data. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.StatefulActivityReadAndPushRequest")
    export class StatefulActivityReadAndPushRequest
    {
        constructor(id: string, requestId: string, data: any)
        constructor(id: string, requestId: string, data: any, transform: (data: any) => any)
        constructor(id: string, requestId: string, data: any, transform?: (data: any) => any)
        {
            Object.defineProperty(this, "Id", { get: () => id, enumerable: true });
            Object.defineProperty(this, "RequestId", { get: () => requestId, enumerable: true });
            Object.defineProperty(this, "Transform", { get: () => transform, enumerable: true });
            Object.defineProperty(this, "Data", { get: () => data, enumerable: true });            
        }

        /** Gets the id of the StatefulActivity instance. */
        public get Id(): string
        {
            return null;
        }
        
        /** Gets the id of the request. */
        public get RequestId(): string
        {
            return null;
        }

        /** If the data read is to be transformed into something else. */
        public get Transform(): (data: any) => any
        {
            return null;
        }

        /** Gets the data to write. */
        public get Data(): any
        {
            return null;
        }        
    }

    /** A response issued by a StatefulActivity in the base thread to its counterpart in a Web Worker. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.StatefulActivityReadResponse")
    export class StatefulActivityReadResponse
    {
        constructor(id: string, requestId: string, data: any)
        {
            Object.defineProperty(this, "Id", { get: () => id, enumerable: true });
            Object.defineProperty(this, "RequestId", { get: () => requestId, enumerable: true });
            Object.defineProperty(this, "Data", { get: () => data, enumerable: true });
        }

        /** Gets the id of the StatefulActivity instance. */
        public get Id(): string
        {
            return null;
        }
        
        /** Gets the id of the request. */
        public get RequestId(): string
        {
            return null;
        }

        /** The data in the response. */
        public get Data(): any
        {
            return null;
        }
    }

    /** A request issued by a StatefulActivity in the Web Worker thread to its counterpart in the base thread for pushing new data and evaluation of the data. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.StatefulActivityPushAndEvaluateRequest")
    export class StatefulActivityPushAndEvaluateRequest
    {
        constructor(id: string, requestId: string, predicate: (data: any, newData: any, statefulActivityId?: string) => any, data: any)
        {
            Object.defineProperty(this, "Id", { get: () => id, enumerable: true });
            Object.defineProperty(this, "RequestId", { get: () => requestId, enumerable: true });
            Object.defineProperty(this, "Predicate", { get: () => predicate, enumerable: true });
            Object.defineProperty(this, "Data", { get: () => data, enumerable: true });
        }

        /** Gets the id of the StatefulActivity instance. */
        public get Id(): string
        {
            return null;
        }
        
        /** Gets the id of the request. */
        public get RequestId(): string
        {
            return null;
        }

        /** The data in the response. */
        public get Predicate(): (data: any, newData: any, statefulActivityId?: string) => any
        {
            return null;
        }

        /** The data in the response. */
        public get Data(): any
        {
            return null;
        }            
    }

    /** A response issued by a StatefulActivity in thebase thread to its counterpart in the Web Worker thread with the result of an evaluation request. */
    @Accelatrix_Serialization.Serialization.KnownType("WebWorkerUtil.StatefulActivityEvaluateResponse")
    export class StatefulActivityEvaluateResponse
    {
        constructor(id: string, requestId: string, result: any)
        {
            Object.defineProperty(this, "Id", { get: () => id, enumerable: true });
            Object.defineProperty(this, "RequestId", { get: () => requestId, enumerable: true });
            Object.defineProperty(this, "Result", { get: () => result, enumerable: true });

            //if (result instanceof Error) debugger;
        }

        /** Gets the id of the StatefulActivity instance. */
        public get Id(): string
        {
            return null;
        }
        
        /** Gets the id of the request. */
        public get RequestId(): string
        {
            return null;
        }

        /** The result of the evaluation. */
        public get Result(): any
        {
            return null;
        }
    }

    function IsWrappedResult(r: any)
    {
        return r != null && (IsPromise(r) || IsTask(r) || IsAwaitable(r));
    } 

    /**
     * Indicates if a given object is a Promise.
     * @param obj The object to inspect.
     */
    export function IsPromise(obj: any)
    {
        return obj != null && obj["then"] != null && obj["then"] instanceof Function && obj["catch"] != null && obj["catch"] instanceof Function;
    }

    /**
     * Indicates if a given object is an ITask.
     * @param obj The object to inspect.
     */
    export function IsAwaitable(obj: any)
    {
        return obj != null && obj["GetAwaiter"] != null && obj["GetAwaiter"] instanceof Function && IsPromise(obj["GetAwaiter"]());
    }    

    /**
     * Indicates if a given object is an ITask.
     * @param obj The object to inspect.
     */
    export function IsTask(obj: any)
    {
        return obj != null && obj["Start"] != null && obj["Start"] instanceof Function && IsAwaitable(obj);
    }

    //******** Defend against package managers that rename symbols */
    Object.defineProperty(Workload.prototype.constructor, "name", { get: () => "Workload" });        
    Object.defineProperty(PackagedWorkload.prototype.constructor, "name", { get: () => "PackagedWorkload" });        
    Object.defineProperty(WorkloadResult.prototype.constructor, "name", { get: () => "WorkloadResult" });
    Object.defineProperty(StatefulActivityWriteRequest.prototype.constructor, "name", { get: () => "StatefulActivityWriteRequest" });
    Object.defineProperty(StatefulActivityReadRequest.prototype.constructor, "name", { get: () => "StatefulActivityReadRequest" });
    Object.defineProperty(StatefulActivityReadAndPushRequest.prototype.constructor, "name", { get: () => "StatefulActivityReadAndPushRequest" });
    Object.defineProperty(StatefulActivityReadResponse.prototype.constructor, "name", { get: () => "StatefulActivityReadResponse" });
    Object.defineProperty(StatefulActivityPushAndEvaluateRequest.prototype.constructor, "name", { get: () => "StatefulActivityPushAndEvaluateRequest" });
    Object.defineProperty(StatefulActivityEvaluateResponse.prototype.constructor, "name", { get: () => "StatefulActivityEvaluateResponse" });
}