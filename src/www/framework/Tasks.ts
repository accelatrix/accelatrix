import { Accelatrix as Accelatrix_Base } from "./Base";
import { Accelatrix as Accelatrix_Globalization } from "./Globalization";
import { Accelatrix as Accelatrix_Serialization } from "./Serialization";
import { Accelatrix as Accelatrix_Enumerable } from "./Enumerable";
import { Accelatrix as Accelatrix_Async } from "./Async";
import { Accelatrix as Accelatrix_AsyncEnumerable } from "./AsyncEnumerable";
import { WebWorkerUtil } from './Tasks-WebWorkers'

export namespace Accelatrix
{
    export class Tasks
    {      
        /** Gets the configuration of the Tasks environment. */  
        public static get Config(): Tasks.ITasksConfig
        {
            return TaskScheduler.config;
        }    
    }

    /** Parallel execution system using Web Workers. */
    export namespace Tasks
    {
        /** The type of source of a script made available to the Tasks engine to be presented to its Web Workers. */
        export enum TaskScriptSource 
        {
            /** URL of the script (must be hosted by the same site due to cross-domain constraints). */
            Url = 'Url',

            /** Plain text JavaScript */
            PlainText = 'PlainText',
        }

        /** The different methods of passing data to and from Web Workers configured in Accelatrix.Tasks.Config.DataPassingMethod. */
        export enum DataPassingMethod
        {
            /** Faster, but data loses the type as a clone is used instead. Explictly add a "$type" property to classes to mitigate this shortcoming. */
            Clone = 'Clone',

            /** Slower, but preserves type information. */
            TypedSerialization = 'TypedSerialization',
        }

        /** The configuration of the Tasks environment. */
        export interface ITasksConfig
        {
            /** Gets the collection of scripts available to the Tasks engine to be presented to its Web Workers. Use .push() to add more. */  
            readonly Scripts: { SourceType: Tasks.TaskScriptSource, Contents: string }[];

            /** Gets or sets the maximum number of active workers at one given moment. */
            MaxParallelism: number;

            /** How data should be passed to and from Web Workers. */
            DataPassingMethod: DataPassingMethod;
        }

        /** Represents the current stage in the lifecycle of a Task.  */
        export enum TaskStatus
        {
            /** The task has been initialized but has not yet been scheduled.*/
            Created = 0,

            /** The task has been scheduled for execution but has not yet begun executing. */
            WaitingToRun = 1,

            /** The task is running but has not yet completed. */
            Running = 2,

            /** The task completed execution successfully. */
            RanToCompletion = 3,

            /** The task acknowledged cancellation by throwing a TaskAbortException. */
            Cancelled = 4,

            /** The task completed due to an unhandled exception. */
            Faulted = 5
        }
        
        /** An Exception depicting a task exception. */
        export class TaskException extends Accelatrix_Base.Exception
        {
            constructor(message)
            {
                super(message);
                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Tasks.TaskException"});
            }
        }

        /** An AbortException depicting a task cancellation. */
        export class TaskAbortException extends TaskException
        {
            constructor(message?: string)
            {
                super(String.IsNullOrWhiteSpace(message) ? "Task is being aborted." : message)
                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Tasks.TaskAbortException"});
            }
        }

        /** An activity in a task. */
        export type TaskActivity<T, TOut> = StatefulActivity<T> | ((...args) => TOut | ITask<T, TOut>) | ITask<T, TOut>;

        /** Represents a generic Task. */
        export interface ITask<T, TOut>
        {
            /** Enqueues a Task in Created status for execution. */
            Start(): Tasks.ITaskPromise<TOut, T>;

            /** Gets the current status of execution. */
            readonly Status: TaskStatus;

            /** Gets the result upon successful completion. */
            readonly Result : TOut;

            /** Gets the exception if the Task has faulted or has been aborted. */
            readonly Exception: Accelatrix_Base.Exception;
    
            /** Cancels an ongoing execution and throws a new TaskAbortException if the task has started, otherwise, it will quietly resolve without errors. */
            Cancel();
            /**
            * Cancels an ongoing execution and throws the specified exception.
            * @param exception A custom exception to throw instead of a TaskAbortException.
            */
            Cancel(exception?: Accelatrix_Base.Exception);

            /** Gets if the task has faulted. */
            readonly IsFaulted: boolean;
    
            /** Gets if the task is complete. */
            readonly IsCompleted: boolean;
    
            /** Gets if the task has been Cancelled. */
            readonly IsCancelled: boolean;
    
            /** Gets if the task does not contain an action. */
            readonly IsActionless: boolean;

            /** Gets a Promise on which an async caller can await for a result. */
            GetAwaiter(): Tasks.ITaskPromise<TOut, T>;

            /** Gets the set of activities in the task. */
            readonly Activities: { 
                                    /** The enumeration of activities to carry out sequentially. */
                                    Actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>,

                                    /** Input arguments passed to the first activity. */                                      
                                    InputArguments: Array<any>
                                 };            
        }

        /** A cencellable promise issued by a Task that is being started.. */
        export interface ITaskPromise<TOut, TIn> extends Accelatrix_Async.Async.IChainablePromise<TOut>
        {
            /** Cancels an ongoing request by raising an AbortException. */
            Cancel(): void;

            /** Attaches a callback to the rejection of the promise. */
            Catch(onrejected: (exception: Accelatrix_Base.Exception) => void): ITaskPromise<TOut, TIn>;

            /** Attaches callbacks for the resolution and/or rejection of the Promise. */
            Then(onfulfilled: (value: TOut) => void): ITaskPromise<TOut, TIn>;

            /** An optional callback to invoke once the request is complete. */
            Finally(callback: (task: ITask<TIn, TOut>) => void): ITaskPromise<TOut, TIn>;
        }        
    
        class TaskPromise<TOut, TIn> implements Tasks.ITaskPromise<TOut, TIn>
        {    
            constructor(task: { Cancel: () => void}, changeResolver: (resolver: (result: TOut) => void) => void, changeRejector: (rejector: (exception: Error) => void) => void, changeFinallizer: (finalizer: (task: ITask<TIn, TOut>) => void) => void)
            {
                Object.defineProperty(this, "Cancel", { enumerable: false, configurable: false, value: () =>
                {
                    task.Cancel();
                }});
    
                Object.defineProperty(this, "then", { enumerable: false, configurable: false, value: (onfulfilled: (value: TOut) => void) =>
                {
                    changeResolver(onfulfilled);
                    return this;
                }});
    
                Object.defineProperty(this, "Then", { enumerable: false, configurable: false, value: (onfulfilled: (value: TOut) => void) =>
                {
                    changeResolver(onfulfilled);
                    return this;
                }});
    
                Object.defineProperty(this, "catch", { enumerable: false, configurable: false, value: (onrejected: (exception: Accelatrix_Base.Exception) => void) =>
                {
                    changeRejector(onrejected);
                    return this;
                }});
    
                Object.defineProperty(this, "Catch", { enumerable: false, configurable: false, value: (onrejected: (exception: Accelatrix_Base.Exception) => void) =>
                {
                    changeRejector(onrejected);
                    return this;
                }});
    
                Object.defineProperty(this, "Finally", { enumerable: false, configurable: false, value: (onFinished: (task: ITask<TIn, TOut>) => void) =>
                {
                    changeFinallizer(onFinished);
                    return this;
                }});
                
                Object.defineProperty(this, "ContinueWith", { value: (continueWith: (result: TOut) => any, merge?: boolean) =>
                { 
                    return Accelatrix_Async.Async.Chain(this, continueWith as any, merge);
                }});                
            }
            
            public Then(onfulfilled: (value: TOut) => void)
            {
                return this as any;
            }
    
            public then(onfulfilled: (value: TOut) => void)
            {
                return this as any;
            }
    
            public Catch(onrejected: (exception: Accelatrix_Base.Exception) => void)
            {
                return this as any;
            }
    
            public catch(onrejected: (exception: Accelatrix_Base.Exception) => void)
            {
                return this as any;
            }
    
            public Cancel()
            {
                return this as any;
            }
    
            public Finally(callback: (task: ITask<TIn, TOut>) => void)
            {
                return this as any;
            }
        
            public ContinueWith<TOut2>(continueWith: (result: TOut) => TOut2): Accelatrix_Async.Async.IChainablePromise<TOut2>;
            public ContinueWith<TOut2>(continueWith: (result: TOut) => Accelatrix_Async.Async.ICancellablePromise<TOut2>, merge?: boolean): Accelatrix_Async.Async.IChainablePromise<TOut2>
            {
                return this as any;
            }            
        }
    
        /** The base implementation of a Task */
        abstract class TaskBase<T, TOut> implements ITask<T, TOut>
        {               
            /**
             * Creates a new TaskBase instance.
             * @param actions A collection of functions that are to be executed sequentially in a chain.
             * @param inputArguments An optional set of initial input arguments to pass onto the first function (any follow-up functions will take as input the output of the previous)
             */
            constructor(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, inputArguments: { 0: T, [key: number] : any; })
            constructor(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, inputArguments?: { 0: T, [key: number] : any; })        
            {
                if (actions == null || !actions.Any())
                    throw new Accelatrix_Base.ArgumentNullException("actions");

                // ---------------   Promise  ------------------------------------------
                var me = this;
                var resolver: (result: TOut) => void = () => { };
                var rejector: (exception: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                var finalizer: (task: ITask<T, TOut>) => void = () => { };
                var myPromise = new TaskPromise(this,
                                                (newResolver) => resolver = newResolver,
                                                (newRejector) => rejector = newRejector,
                                                (newFinalizer) => finalizer = newFinalizer);
    
                Object.defineProperty(this, "GetAwaiter", { value: () => myPromise, enumerable: false, configurable: false });
    
                // ---------------   Activity ------------------------------------------
                var workRoster = ({ 
                                        Actions: actions,
                                        InputArguments: inputArguments,
                                    });

                // ---- unpack during deserialisation
                if (workRoster.Actions[0] == '')
                {
                    workRoster = null;
                    // Object.defineProperty(this, "Activities", { get: () => workRoster, enumerable: true, configurable: true });
                }
                else
                    Object.defineProperty(this, "Activities", { get: () => workRoster, enumerable: true });            

                
    
    
                // ---------------   Result  ------------------------------------------
                // Result Get and Set
                var setResult = (value: TOut) =>
                {
                    if (this.Status >= TaskStatus.RanToCompletion) return;                   
    
                    Object.defineProperty(this, "Result", { get: () => value, enumerable: false, configurable: false });
                    Object.defineProperty(this, "Exception", { get: () => undefined, enumerable: false, configurable: false });
                    Object.defineProperty(this, "Status", { get: () => TaskStatus.RanToCompletion, enumerable: false, configurable: false });
                    Object.defineProperty(this, "IsComplete", { get: () => true, enumerable: false, configurable: false });
                    Object.defineProperty(this, "Cancel", { value: () => {}, enumerable: false, configurable: false });
                    
                    try
                    {                        
                        if (resolver != null) resolver(value);
                    }
                    catch(e)
                    {                        
                    }
                    finally
                    {                        
                        if (finalizer != null) finalizer(me);
                        rejector = null;
                        resolver = null;
                        finalizer = null;
                    }
                };
    
                Object.defineProperty(this, "Result", { get: () => undefined, set: setResult, enumerable: false, configurable: true });
    
    
                // ---------------   Exception  ------------------------------------------
                // Exception  Get and Set
                var setException = (value: Accelatrix_Base.Exception) =>
                {
                    if (this.Status != TaskStatus.Cancelled)
                        Object.defineProperty(this, "Status", { get: () => TaskStatus.Faulted, enumerable: false, configurable: false });
    
                    Object.defineProperty(this, "Result", { get: () => undefined, enumerable: false, configurable: false });
                    Object.defineProperty(this, "Exception", { get: () => value, enumerable: false, configurable: false });
                    Object.defineProperty(this, "Cancel", { value: () => {}, enumerable: false, configurable: false });
                    
                    
                    try
                    {
                        if (rejector != null) rejector(value);
                    }
                    catch(e)
                    {                        
                    }
                    finally
                    {                        
                        if (finalizer != null) finalizer(me);
                    }
                };
    
                Object.defineProperty(this, "Exception", { get: () => undefined, set: setException, enumerable: false, configurable: true });
    
    
                // ---------------   Start  ------------------------------------------
    
                var start = () =>
                {
                    if (this.Status != TaskStatus.Created) return myPromise;
    
                    if (this.IsActionless)
                    {
                        //setTimeout(() => setResult(undefined), 0);
                        return Accelatrix_Async.Async.AsPromise(undefined);
                    }
                    else
                        TaskScheduler.Enqueue(this);                    
    
                    return myPromise;
                }
    
                Object.defineProperty(this, "Start", { value: start, enumerable: false, configurable: true });
    
    
                // ---------------   Cancel  ------------------------------------------
                var cancel = (exception?: Accelatrix_Base.Exception) =>
                {
                    if (this.IsCancelled || this.IsCompleted || this.IsFaulted) return;
    
                    if (this.Status < TaskStatus.RanToCompletion) TaskScheduler.RemovePendingTask(this);
    
                    Object.defineProperty(this, "Status", { get: () => TaskStatus.Cancelled, enumerable: false, configurable: false });
                    Object.defineProperty(this, "IsCancelled", { get: () => true, enumerable: false, configurable: false });
                    Object.defineProperty(this, "Result", { get: () => undefined, set: () => [], enumerable: false, configurable: false });                    
    
                    var abort = exception != null
                                ? exception
                                : new Tasks.TaskAbortException();
    
                    Object.defineProperty(this, "Exception", { get: () => abort, set: () => [], enumerable: false, configurable: false });
                    Object.defineProperty(this, "Cancel", { value: () => {}, enumerable: false, configurable: false });
    
                    try
                    {
                        if (rejector != null) rejector(abort);
                    }
                    catch(e)
                    {
    
                    }
                    finally
                    {
                        if (finalizer != null) finalizer(me);
                    }
                }
    
                Object.defineProperty(this, "Cancel", { value: cancel, enumerable: false, configurable: true });
            }
    
            //#region Properties
    
            /** Gets the set of activities */
            public get Activities(): { Actions: Array<(...args) => TOut | TaskBase<T, TOut>>, InputArguments: Array<any>}
            {
                return null;
            }
    
            public get Status(): TaskStatus
            {
                return TaskStatus.Created;
            }
    
            /** Gets the result- */
            public get Result(): TOut
            {
                return undefined;
            }
    
            /** Gets the exception if the Task has faulted or has been aborted. */
            public get Exception(): Accelatrix_Base.Exception
            {
                return null;
            }
    
            /** Gets if the task has faulted. */
            public get IsFaulted(): boolean
            {
                return false;
            }
    
            /** Gets if the task is complete. */
            public get IsCompleted(): boolean
            {
                return false;
            }
    
            /** Gets if the task has been Cancelled. */
            public get IsCancelled(): boolean
            {
                return false;
            }
    
            /** Gets if the task does not contain an action. */
            public get IsActionless(): boolean
            {
                return this.Activities.Actions == null || !this.Activities.Actions.Any() || this.Activities.Actions[0] == null;
            }
    
            /** If the task was created within a task. */
            public get IsNested(): boolean
            {
                return self["__WebWorkerNestingLevel__"] != null;
            }            
    
            //#endregion
    
            /** Enqueues a Task in Created status for execution. */
            public Start() : Tasks.ITaskPromise<TOut, T>
            {
                return null;
            }
    
            /** Cancels an ongoing execution and throws a new TaskAbortException if the task has started, otherwise, it will quietly resolve without errors. */
            public Cancel()
            /**
            * Cancels an ongoing execution and throws the specified exception.
            * @param exception A custom exception to throw instead of a TaskAbortException.
            */
            public Cancel(exception?: Accelatrix_Base.Exception)
            public Cancel(exception?: Accelatrix_Base.Exception)
            {
    
            }            
    
            /** Gets a Promise on which an async caller can await for a result. */
            public GetAwaiter(): Tasks.ITaskPromise<TOut, T>
            {
                return null as any;
            }
    
            /** Cancells all pending or ongoing activities. */
            public static CancelAll()
            {
                TaskScheduler.CancelAll();
            }
        }    
    
        /**
         * A single-activity Task that is executed in a separate thread.
         * @description Mind to set the Accelatrix.Tasks.Config.Scripts property to present the baseline JS scripts/code segments to be used by Accelatrix.Tasks.\nThe code of Accelatrix will automaticallty be present in the parallelized runtime.
         */        
        export class Task<T, TOut> extends TaskBase<T, TOut>
        {
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The parameterless function to execute and produce a result of T or a subtask of T.
            */
            public constructor(action: () => TOut | ITask<T, TOut>)
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The function to execute and produce a result of T or a subtask of T
            * @param arg0 An argument to be passed to the function.
            */
            public constructor(action: (arg0: T) => TOut | ITask<T, TOut>, arg0: T)
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The function to execute and produce a result of T or a subtask of T
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            */
            public constructor(action: (arg0: T, arg1: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any)
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The function to execute and produce a result of T or a subtask of T
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            * @param arg2 A third argument to be passed to the function.
            */
            public constructor(action: (arg0: T, arg1: any, arg2: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any, arg2: any)
            public constructor(action: (arg0?: T, arg1?: any, arg2?: any) => TOut | ITask<T, TOut>, arg0?: T, arg1?: any, arg2?: any)
            {
                if (action == null) throw new Accelatrix_Base.ArgumentNullException("action"); 

                super([action], arg0 === undefined ? null : [arg0, arg1, arg2].TakeWhile(z => z !== undefined).ToList() as any);
            }

            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            */
            public static StartNew<T, TOut>(action: () => TOut | ITask<T, TOut>): Task<T, void>
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the function.
            */
            public static StartNew<T, TOut>(action: (arg0: T) => TOut | ITask<T, TOut>, arg0: T): Task<T, TOut>
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            */
            public static StartNew<T, TOut>(action: (arg0: T, arg1: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any): Task<T, TOut>
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            * @param arg2 A third argument to be passed to the function.
            */
            public static StartNew<T, TOut>(action: (arg0: T, arg1: any, arg2: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any, arg2: any): Task<T, TOut>            
            public static StartNew<T, TOut>(action: (arg0?: T, arg1?: any, arg2?: any) => TOut | ITask<T, TOut>, arg0?: T, arg1?: any, arg2?: any): Task<T, TOut>
            {
                var newTask = new Task(action, arg0, arg1, arg2);

                TaskScheduler.Enqueue(newTask);

                return newTask;
            }            
        }

        /** A set of chained sequential activities executed in a separate thread. */
        export class ActivitySet<T, TOut> extends TaskBase<T, TOut>
        {
            /**
             * Creates a new ActivitySet instance.
             * @param actions An enumeration of functions or Tasks that are to be executed sequentially in a chain.
             */
            constructor(actions: Array<TaskActivity<T, TOut>>)            
            /**
             * Creates a new ActivitySet instance.
             * @param actions A collection of functions or Tasks that are to be executed sequentially in a chain.
             * @param inputArguments An optional set of initial input arguments to pass onto the first function (any follow-up functions will take as input the output of the previous)
             */
            constructor(actions: Array<TaskActivity<T, TOut>>, inputArguments: { 0: T, [key: number] : any; })
            constructor(actions: Array<TaskActivity<T, TOut>>, inputArguments?: { 0: T, [key: number] : any; })    
            {
                super(actions, inputArguments)
            }

            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            */
            public static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>): ActivitySet<T, void>
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            */
            public static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0: T): ActivitySet<T, TOut>
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            */
            public static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0: T, arg1: any): ActivitySet<T, TOut>
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            * @param arg2 A third argument to be passed to the first function.
            */
            public static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0: T, arg1: any, arg2: any): ActivitySet<T, TOut>            
            public static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0?: T, arg1?: any, arg2?: any): ActivitySet<T, TOut>
            {
                var newTask = new ActivitySet(actions, arg0 === undefined ? null : [arg0, arg1, arg2].TakeWhile(z => z !== undefined).ToList() as any);

                TaskScheduler.Enqueue(newTask);

                return newTask;
            }            
        }

        /** A continuous stream of chained sequential activities executed in a separate thread. The task completes during the first exception, or at the end of the stream. */
        export class ActivityStream<T, TOut> extends TaskBase<T, TOut>
        {
            /**
             * Creates a new ActivitySet instance.
             * @param actions An enumeration of functions or Tasks that are to be executed sequentially in a chain.
             */
            constructor(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>)            
            /**
             * Creates a new ActivitySet instance.
             * @param actions A collection of functions or Tasks that are to be executed sequentially in a chain.
             * @param inputArguments An optional set of initial input arguments to pass onto the first function (any follow-up functions will take as input the output of the previous)
             */
            constructor(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, inputArguments: { 0: T, [key: number] : any; })
            constructor(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, inputArguments?: { 0: T, [key: number] : any; })    
            {
                super(actions, inputArguments)
            }

            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            */
            public static StartNew<T, TOut>(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>): ActivityStream<T, void>
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            */
            public static StartNew<T, TOut>(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0: T): ActivityStream<T, TOut>
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            */
            public static StartNew<T, TOut>(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0: T, arg1: any): ActivityStream<T, TOut>
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            * @param arg2 A third argument to be passed to the first function.
            */
            public static StartNew<T, TOut>(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0: T, arg1: any, arg2: any): ActivityStream<T, TOut>            
            public static StartNew<T, TOut>(actions: Accelatrix_Enumerable.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0?: T, arg1?: any, arg2?: any): ActivityStream<T, TOut>
            {
                var newTask = new ActivityStream(actions, arg0 === undefined ? null : [arg0, arg1, arg2].TakeWhile(z => z !== undefined).ToList() as any);

                TaskScheduler.Enqueue(newTask);

                return newTask;
            }            
        }

        /**
         *  A set of parallel activities that jointly collaborate to produce a consolidated result. 
         *  The CombinedTask will conclude once all Tasks have successfully completed, or when the first exception is thrown. The OnPartialResult callback provides the means to interrupt the process.
        */
        export class CombinedTask<T, TOut extends Array<TOut>> extends TaskBase<T, TOut>
        {
            /**
             * Creates a new CombinedTask instance.
             * @param actions An enumeration of functions or Tasks that are to be executed parallely to contribute to a combined result.
             */
            constructor(actions: Array<TaskActivity<T, any>>)            
            /**
             * Creates a new CombinedTask instance.
             * @param actions An enumeration of functions or Tasks that are to be executed parallely to contribute to a combined result.
             * @param inputArguments An optional set of initial input arguments to pass onto the each member.
             */
            constructor(actions: Array<TaskActivity<T, any>>, inputArguments: { 0: T, [key: number] : any; })
            constructor(actions: Array<TaskActivity<T, any>>, inputArguments?: { 0: T, [key: number] : any; })    
            {
                super(actions, inputArguments)

                let args = inputArguments == null || (inputArguments as any).length == 0 ? null : inputArguments as any;
    
                var queue: Array<ITask<any, any>> = [];
                var result = [];

                var onInterimResult: (result: TOut) => void;
    
                var onTaskCompleted = (task: ITask<any, any>) =>
                {
                    if (task.Exception != null)
                    {
                        if (this.Exception == null)
                        {
                            (this as any).Exception = task.Exception;

                            queue.Where(z => z.Status == TaskStatus.Running || z.Status == TaskStatus.WaitingToRun)
                                 .ForEach(z => z.Cancel());
                        }

                        return;
                    }

                    if (result.length == 0)
                        Object.defineProperty(this, "Status", { get: () => TaskStatus.Running, enumerable: false, configurable: true });

                    result.push(task.Result);
                
                    try
                    {
                        if (onInterimResult != null)
                            onInterimResult(task.Result);
                    }
                    catch(ex)
                    {

                    }
                    finally
                    {
                        if (result.length == queue.length) // done
                            (this as any).Result = result;
                    }
                };

                // ---------------   OnPartialResult  ------------------------------------------
                Object.defineProperty(this, "OnPartialResult", { value: (onPartialResult: (result: TOut) => void) => { onInterimResult = onPartialResult; return this; } , enumerable: false, configurable: false });

                // ---------------   Start  ------------------------------------------
                var me = this;

                var start = () =>
                {
                    if (this.Status != TaskStatus.Created) return this.GetAwaiter();
    
                    if (this.IsActionless)
                    {
                        var me = this;
                        //setTimeout(() => (me as any).Result = undefined, 0);
                        return Accelatrix_Async.Async.AsPromise(undefined);
                    }
                    else
                    {
                        actions.Select(z => z instanceof Function
                                            ? new Task(z as any, args) as ITask<T, TOut>
                                            : z as ITask<T, TOut>)
                                .ForEach(z =>
                                {
                                    if (z.Status > TaskStatus.Created)
                                        throw new TaskException("Cannot combine a task that has already been queue for execution.");

                                    if (args != null)
                                        z.Activities.InputArguments = args;

                                    queue.push(z);                                    
                                });

                        queue.forEach(z => z.Start().Finally(t => onTaskCompleted(t)));

                        Object.defineProperty(this, "Status", { get: () => TaskStatus.WaitingToRun, enumerable: false, configurable: true });
                    }                 
    
                    return this.GetAwaiter();
                }
    
                Object.defineProperty(this, "Start", { value: start, enumerable: false, configurable: false });


                // ---------------   Cencel  ------------------------------------------
                var originalCancel = this.Cancel;

                var cancel = (exception: Accelatrix_Base.Exception) =>
                {
                    originalCancel(exception);

                    queue.Where(z => z.Status == TaskStatus.Running || z.Status == TaskStatus.WaitingToRun)
                         .ForEach(z => z.Cancel());                    
                };

                Object.defineProperty(this, "Cancel", { value: cancel, enumerable: false, configurable: true });
            }

            /**
             * Allows to subscribe to partial results.
             * @returns  Returns the same CombinedTask instance.
             */
            public OnPartialResult(onPartialResult: (result: TOut) => void) : CombinedTask<T, TOut>
            {
                return null;
            }

            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            */
            public static StartNew<T, TOut extends Array<TActivities>, TActivities extends TOut>(actions: Array<TaskActivity<T, TActivities>>): CombinedTask<T, TOut>
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed.
            */
            public static StartNew<T, TOut extends Array<TActivities>, TActivities extends TOut>(actions: Array<TaskActivity<T, TActivities>>, arg0: T): CombinedTask<T, TOut>
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed.
            * @param arg1 A second argument to be passed.
            */
            public static StartNew<T, TOut extends Array<TActivities>, TActivities extends TOut>(actions:Array<TaskActivity<T, TActivities>>, arg0: T, arg1: any): CombinedTask<T, TOut>
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed.
            * @param arg1 A second argument to be passed.
            * @param arg2 A third argument to be passed.
            */
            public static StartNew<T, TOut extends Array<TActivities>, TActivities extends TOut>(actions: Array<TaskActivity<T, TActivities>>, arg0: T, arg1: any, arg2: any): CombinedTask<T, TOut>            
            public static StartNew<T, TOut extends Array<TActivities>, TActivities extends TOut>(actions: Array<TaskActivity<T, TActivities>>, arg0?: T, arg1?: any, arg2?: any): CombinedTask<T, TOut>
            {
                var newTask = new CombinedTask(actions, arg0 === undefined ? null : [arg0, arg1, arg2].TakeWhile(z => z !== undefined).ToList() as any);

                newTask.Start();

                return newTask as CombinedTask<T, TOut>;
            }
        }

        /**
         * An activity that can maintain state between concurrent tasks.
         * @example
         * var shared = Accelatrix.Tasks.StatefulActivity();
         * 
         * Accelatrix.Tasks.CombinedTask.StartNew([
		 *			   new Accelatrix.Tasks.ActivitySet([
		 *								z => z.Take(1),
		 *								shared.PushAndEvaluate(z => 1,
         *                                                     (accumulated, mine) => accumulated.Where(z => z != null).Any()
         *                                                                            ? z => z.Take(0)
         *                                                                            : z => z ),
		 * 		 					    z => z.ToList()
		 *						  ],
		 *						  [[0, 1, 2, 3, 4, 5]]),
         *
		 *			   new Accelatrix.Tasks.ActivitySet([
		 *								z => z.Take(3),
		 *								shared.PushAndEvaluate(z => 3,
         *                                                     (accumulated, mine) => accumulated.Where(z => z != null).Any()
         *                                                                            ? z => z.Take(0)
         *                                                                            : z => z.Take(1) ),
		 *							    z => z.ToList()
		 * 						   ],
		 *						   [[6, 7, 8, 9,10, 11]])
		 *		   ])
		 *         .GetAwaiter()
		 *         .Then(z => console.log(z))
		 *         .Catch(ex => console.error(ex))
         *         .Finally(t => shared.Dispose())
         */
        @Accelatrix_Serialization.Serialization.KnownType("Accelatrix.Tasks.StatefulActivity")
        export class StatefulActivity<T> extends Function
        {
            public constructor()
            {
                var f = `if (this.toJSON == null) return null;
                         var myProxy = new this.prototype.proxy(this.toJSON());
                         return myProxy.Execute(input)`;

                super("input", f);

                var me = this.bind(this);
                me.__proto__ = this;

                this.prototype["proxy"] = StatefulActivityProxy;

                var sequenceID = StatefulActivityHandler.Sequence++;
                var webWorkerId = self["__WebWorkerId__"] == null ? "" : self["__WebWorkerId__"];
                var webWorkerNestingLevel = self["__WebWorkerNestingLevel__"] == null ? "" : self["__WebWorkerNestingLevel__"];
                var myId = webWorkerNestingLevel + "_" + webWorkerId + "_" + sequenceID;                    

                Object.defineProperty(me, "Id", { get: () => myId, enumerable: true });
                Object.defineProperty(this, "Id", { get: () => myId, enumerable: true });

                Object.defineProperty(me, "Dispose", { value: () => StatefulActivityHandler.Drop(myId), enumerable: true });
                Object.defineProperty(this, "Dispose", { value: () => StatefulActivityHandler.Drop(myId), enumerable: true });

                StatefulActivityHandler.Create(me);

                var toJson = () =>
                             {
                                return {
                                            $type: "Accelatrix.Tasks.StatefulActivityProxy",
                                            Id: myId,
                                            Members: [],
                                        }
                             };

                Object.defineProperty(this, "toJSON", { enumerable: false, configurable: true, value: toJson});

                Object.defineProperty(me, "toJSON", { enumerable: false, configurable: true, value: me.__proto__.toJSON });

                // ---------------------------- Add to members --------------
                var addToMembers = (operationName: string, args: Array<any>) =>
                                   {
                                        var currentSequence = StatefulActivityHandler.Sequence;
                                        StatefulActivityHandler.Sequence = sequenceID--;
                                        var result = new StatefulActivity();
                                        StatefulActivityHandler.Sequence = currentSequence;
                                        var myself = result;
                                        result = result.bind(result);
                                        
                                        var originalJSON = this.toJSON;
                    
                                        Object.defineProperty(myself["__proto__"], "toJSON", { enumerable: false, configurable: true, value: () =>
                                        {
                                            var parent = originalJSON();
                                            var myJson = {
                                                            $type: parent["$type"],
                                                            Id: parent["Id"],
                                                            Members: parent["Members"].concat({ Op: operationName, Args: args }),
                                                         }

                                            return myJson;
                                        }});
                                        
                                        
                                        Object.defineProperty(result, "toJSON", { enumerable: false, configurable: true, value: myself["__proto__"].toJSON});
                                        
                                        return result;
                                   };


                // -------------------- Read ---------------
                var read = () => addToMembers("Read", null);

                Object.defineProperty(me, "Read", { enumerable: false, value: read });
                Object.defineProperty(this, "Read", { enumerable: false, value: read });


                // -------------------- ConcatRead ---------------
                var concatRead = () => addToMembers("ConcatRead", null);

                Object.defineProperty(me, "ConcatRead", { enumerable: false, value: concatRead });
                Object.defineProperty(this, "ConcatRead", { enumerable: false, value: concatRead });


                // -------------------- Write / Set ---------------
                var set = (dataTransform: (data: T) => any) => addToMembers("Set", [ dataTransform ]);

                Object.defineProperty(me, "Set", { enumerable: false, value: set });
                Object.defineProperty(this, "Set", { enumerable: false, value: set });                


                // -------------------- Push ---------------
                var push = (dataTransform: (data: T) => any) => addToMembers("Push", [ dataTransform ]);

                Object.defineProperty(me, "Push", { enumerable: false, value: push });
                Object.defineProperty(this, "Push", { enumerable: false, value: push });     


                // -------------------- Read And Push ---------------
                var readAndPush = (dataTransform: (data: T) => any) => addToMembers("ReadAndPush", [ dataTransform ]);

                Object.defineProperty(me, "ReadAndPush", { enumerable: false, value: readAndPush });
                Object.defineProperty(this, "ReadAndPush", { enumerable: false, value: readAndPush });     


                // -------------------- PushAndEvaluate ---------------
                var pushAndEvaluate = (dataTransform: ((data: T) => any), evaluator: (accumulatedData: Array<any>, newData: any) => ((data: T) => any)) => addToMembers("PushAndEvaluate", [ dataTransform, evaluator ] ); ;

                Object.defineProperty(me, "PushAndEvaluate", { enumerable: false, value: pushAndEvaluate });
                Object.defineProperty(this, "PushAndEvaluate", { enumerable: false, value: pushAndEvaluate });


                // -------------------- StreamPushAndEvaluate ---------------
                var streamPushAndEvaluate = (dataTransform: ((data: T) => any), evaluator: (accumulatedData: Array<any>, newData: any) => ((data: T) => any), bufferSize?: number) => addToMembers("StreamPushAndEvaluate", [ dataTransform, evaluator, bufferSize ] ); ;

                Object.defineProperty(me, "StreamPushAndEvaluate", { enumerable: false, value: streamPushAndEvaluate });
                Object.defineProperty(this, "StreamPushAndEvaluate", { enumerable: false, value: streamPushAndEvaluate });                

                return me;
            }

            /** Gets the unique id of the current StatefulActivity instance. */
            public get Id(): string
            {
                return null as any;
            }

            /** Reads the dataset stored in the StatefulActivity. */
            public Read() : StatefulActivity<Array<T>> 
            {
                return null as any;
            }

            /** Concacts the current data with the dataset stored in the StatefulActivity. */
            public ConcatRead() : StatefulActivity<Array<T>> 
            {
                return null as any;
            }

            /** 
             * Reads the dataset stored in the StatefulActivity and pushes an additional set.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             */
            public ReadAndPush<TOut>(dataTransform: (data: T) => TOut) : StatefulActivity<Array<T>> 
            {
                return null as any;
            }

            /**
             * Pushes additional state into the StatefulActivity.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             */
            public Push<TOut>(dataTransform: (data: T) => TOut) : StatefulActivity<T> 
            {
                return this;
            }

            /**
             * Discards any existing data already pushed into the StatefulActivity by setting its value.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             */
            public Set<TOut>(dataTransform: (data: T) => TOut) : StatefulActivity<T> 
            {
                return this;
            }            

            /**
             * Pushes additional state into the StatefulActivity and evaluates the state to produce a follow-up action to apply only on the untransformed state being pushed.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             * @param evaluator The function that receives the existing state and the new delta being pushed and produces a follow-up action to be applied to the original data being pushed before transformation.
             */
            public PushAndEvaluate<TOut>(dataTransform: (data: T) => TOut, evaluator: (accumulatedData: Array<TOut>, newData: TOut, statefulActivityId?: string) => ((data: T) => any)) : StatefulActivity<T>
            {
                return this;
            }

            /**
             * In a continuous manner, pushes additional state into the StatefulActivity as a buffer and evaluates the state to produce a follow-up action to apply only on the untransformed state being pushed.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             * @param evaluator The function that receives the existing state and the new delta being pushed and produces a follow-up action to be applied to to the original data being pushed before transformation.
             * @param bufferSize How many elements are to be submitted during each push and evaluation cycle.
             */
            public StreamPushAndEvaluate<TOut>(dataTransform: (data: T) => TOut, evaluator: (accumulatedData: Array<TOut>, newData: TOut, statefulActivityId?: string) => ((data: T) => any), bufferSize?: number) : StatefulActivity<T>
            {
                return this;
            }

            /** Frees up any resources consumed by the current StatefulActivity, typically called during the .Finally() callback of a CombinedTask. */
            public Dispose()
            {
                StatefulActivityHandler.Drop(this.Id);
            }

            public toJSON()
            {
                return null;
            }
        }

        @Accelatrix_Serialization.Serialization.KnownType("Accelatrix.Tasks.StatefulActivityProxy")
        class StatefulActivityProxy<T> extends Function
        {
            constructor(structure: { Id: string, Members: Array<{ Op: string, Args: [] }> }, id?: string, members?: Array<{ Op: string, Args: [] }>)            
            {
                var f = `return this.Execute(input);`;

                super("input", f);

                var me = this;            

                if ((structure == null || structure.toString() == "") && id != null)
                {
                    structure = {
                                    "$type": "Accelatrix.Tasks.StatefulActivityProxy",
                                    Id: id,
                                    Members: members
                                } as any;
                }

                var result = me.bind(me);

                Object.defineProperty(result, "Execute", { enumerable: false, value: function(input: T)
                {
                    return StatefulActivityHandler.Execute(structure, input);
                }});

                Object.defineProperty(this, "Execute", { enumerable: false, value: function(input: T)
                {
                    return StatefulActivityHandler.Execute(structure, input);
                }});                

                Object.defineProperty(result, "toJSON", {value: function()
                {
                    return structure;
                }});  
                
                Object.defineProperty(this, "toJSON", {value: function()
                {
                    return structure;
                }});              

                return result;
            }
        }

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(TaskException.prototype.constructor, "name", { get: () => "TaskException" });             
        Object.defineProperty(TaskAbortException.prototype.constructor, "name", { get: () => "TaskAbortException" });         
        Object.defineProperty(TaskPromise.prototype.constructor, "name", { get: () => "TaskPromise" });         
        Object.defineProperty(TaskBase.prototype.constructor, "name", { get: () => "TaskBase" });         
        Object.defineProperty(Task.prototype.constructor, "name", { get: () => "Task" });         
        Object.defineProperty(ActivitySet.prototype.constructor, "name", { get: () => "ActivitySet" });         
        Object.defineProperty(ActivityStream.prototype.constructor, "name", { get: () => "ActivityStream" });         
        Object.defineProperty(CombinedTask.prototype.constructor, "name", { get: () => "CombinedTask" });         
        Object.defineProperty(StatefulActivity.prototype.constructor, "name", { get: () => "StatefulActivity" });         
        Object.defineProperty(StatefulActivityProxy.prototype.constructor, "name", { get: () => "StatefulActivityProxy" });         
    }

    export namespace Collections
    {
        /** Enumerable operations in enumerations. */
        export interface IEnumerableOps<T> // extends Accelatrix_Enumerable.Collections.IEnumerableOps<T>
        {
            /**
             * Iterates through each element in the enumeration and executes an action in a separate task.
             * @param action The action to execute.
             */
            ForAll<TOut>(action: (element: T, index?: number) => TOut): Accelatrix_Async.Async.IChainablePromise<TOut[]>;
        }

        (Array as any).prototype.ForAll = function(action: (element: any, index?: number) => any)
        {
            var tasks: Array<Tasks.Task<any, any>> = [];

            for (var i = 0; i < this.length; i++)
               tasks.push(new Tasks.Task(action, this[i], i));

            return tasks.length == 0
                   ? Accelatrix_Async.Async.AsPromise(null)
                   : Tasks.CombinedTask.StartNew(tasks).GetAwaiter();            
        }

        Accelatrix_Enumerable.Collections.Enumerable.prototype["ForAll"] = function(action: (element: any, index?: number) => any)
        {
            var myEnumerator = this.GetEnumerator();
        
            var index = 0;
            var tasks: Array<Tasks.Task<any, any>> = [];
    
            while (myEnumerator.MoveNext())
                tasks.push(new Tasks.Task(action, myEnumerator.Current, index++));

            return tasks.length == 0
                   ? Accelatrix_Async.Async.AsPromise(null)
                   : Tasks.CombinedTask.StartNew(tasks).GetAwaiter();
        }
    }

    namespace TaskScheduler
    {
        var maxParallelism = 8;
        var dataPassingMethod = Tasks.DataPassingMethod.Clone;
        var workerId = 0;

        if (!IsNested())
            eval.bind(TaskScheduler)(WebWorkersCode()); // creates WebWorkerUtil which is actually defined in the webWorkersCode as it is shared.       

        function WebWorkersCode() : string
        {
            return "__WEB_WORKER_CODE__";  // injected from Tasks-WebWorkers.ts during build
        }

        export var config = new class TasksConfig implements Tasks.ITasksConfig
                            {
                                /** The collection of scripts available to the Tasks engine to be presented to its Web Workers. */  
                                public get Scripts(): { SourceType: Tasks.TaskScriptSource, Contents: string }[]
                                {
                                    return ScriptHandler.scriptSources;
                                }
                        
                                /** Gets or sets the maximum number of active workers at one given moment. */
                                public get MaxParallelism()
                                {
                                    if (maxParallelism == null)
                                    {
                                        try
                                        {
                                            maxParallelism = self != null && self.clientInformation != null && self.clientInformation.hardwareConcurrency > 1
                                                                ? self.clientInformation.hardwareConcurrency * 2
                                                                : !IsNested()
                                                                    ? 8
                                                                    : 2;
                                        }
                                        catch (e)
                                        {
                                            maxParallelism = !IsNested()
                                                             ? 8
                                                             : 2; //fallback value
                                        }
                                    }
                        
                                    return maxParallelism;
                                }
                                public set MaxParallelism(value: number)
                                {
                                    if (value == maxParallelism) return;
                                    maxParallelism = value;
                                }
                                
                                /** Gets or sets how data is to be passed to and from Web Workers. */
                                public get DataPassingMethod(): Tasks.DataPassingMethod
                                {
                                    return dataPassingMethod;
                                }
                                public set DataPassingMethod(value: Tasks.DataPassingMethod)
                                {
                                    dataPassingMethod = value == null
                                                        ? Tasks.DataPassingMethod.Clone
                                                        : value;
                                }
                            }

        export function IsTask(obj: any)
        {
            return WebWorkerUtil.IsTask(obj);
        }

        /** If operating already in a Web Worker. */
        export function IsNested(): boolean
        {
            return self["__WebWorkerNestingLevel__"] != null;
        }

        export function Enqueue(task: Tasks.ITask<any, any> | Accelatrix_Enumerable.Collections.IEnumerableOps<Tasks.ITask<any, any>>)
        {
            Queue.Enqueue(task);
        }

        export function RemovePendingTask(task: Tasks.ITask<any, any>)
        {
            Queue.RemovePendingTask(task);
        }        

        export function CancelAll()
        {
            Queue.CancelAll();
        }

        export function Broadcast(msg: any, exceptedTo?: Array<number>)
        {
            Queue.Broadcast(msg, exceptedTo);
        }

        function SpawnWorker()
        {   
                var workerCode = "var __WebWorkerScripts__ = [{\"SourceType\":\"PlainText\",\"Contents\": \"" + ScriptHandler.ScriptContents().replace(/\\/g, "\\\\").replace(/\"/g, "\\\"").replace(/\n/g, "\\n").replace(/\r/g, "\\r") + "\"}];\n" +
                                 "var __WebWorkerNestingLevel__ = " + (self["__WebWorkerNestingLevel__"] == null ? 0 : self["__WebWorkerNestingLevel__"] + 1) + ";\n" +
                                 "var __WebWorkerId__ = " + workerId++ + ";\n" +
                                 ScriptHandler.ScriptContents() + "\n" +
                                 WebWorkersCode();

                var worker: Worker = null;

                if (Blob == null)
                {
                    worker = new Worker("data:text/javascript;charset=US-ASCII," + encodeURIComponent(workerCode));
                }
                else
                {
                    var blob;
                    try
                    {
                        blob = new Blob([workerCode], { type: 'application/javascript' });
                    }
                    catch (e)
                    {
                        // Backwards-compatibility
                        var blobBuilder = self["BlobBuilder"] || self["WebKitBlobBuilder"] || self["MozBlobBuilder"] || self["MSBlobBuilder"];
                        blob = new blobBuilder();
                        blob.append(workerCode);
                        blob = blob.getBlob();
                    }

                    worker = new Worker(URL.createObjectURL(blob));
                }

            return worker;
        }

        var Queue = new class TaskSchedulerQueue
        {
            private static readonly CANCEL_TIMEOUT = self["__WebWorkerNestingLevel__"] == null
                                                     ? 2000
                                                     : 2000 / (self["__WebWorkerNestingLevel__"] * (1 + self["__WebWorkerNestingLevel__"]));

            private static readonly NUMBER_OF_BUFFERED_ACTIONS = 3333; // when the task has an enumeration of actions (not an array), how many are submitted in a batch
            
            private pending: Tasks.ITask<any, any>[] = [];
            private workers: { Worker: Worker, Task: Tasks.ITask<any, any>, IsBusy: boolean, Culture: Accelatrix_Globalization.Globalization.ILocaleFormatInfo, Id: number, NestingLevel: number }[] = [];
            private activeWorkers = 0;

            private get Pending()
            {
                return this.pending;
            }

            private get Workers()
            {
                return this.workers;
            }

            private get ActiveWorkers()
            {
                return this.activeWorkers;
            }
            private set ActiveWorkers(value: number)
            {
                this.activeWorkers = value;
            }

            /** Depending on runtime conditions, run in sync or not */
            private get RunInSync()
            {
                return Tasks.Config.MaxParallelism <= 0;

                /*
                if (Tasks.Config.MaxParallelism <= 0) return true;

                var isIdling = this.ActiveWorkers <= 0;
                var willQueue = this.Pending.length > Tasks.Config.MaxParallelism;

                return willQueue
                       ? false
                       : isIdling && !willQueue
                         ? true
                         : false;
                         */
            }

            public Enqueue(task: Tasks.ITask<any, any> | Accelatrix_Enumerable.Collections.IEnumerableOps<Tasks.ITask<any, any>>)
            {
                if (task == null) return;
    
                var tasks = task.GetType().IsArray
                            ? task as Accelatrix_Enumerable.Collections.IEnumerableOps<Tasks.ITask<any, any>>
                            : [<Tasks.ITask<any, any>>task];
    
                tasks.Where(z => z.IsActionless && z.Status == Tasks.TaskStatus.Created)
                     .ForEach(z =>
                     {
                         (z as any).Result = undefined;
                     });
    
                tasks = tasks.Where(z => !(z.IsActionless && z.Status == Tasks.TaskStatus.Created)).ToList();
    
                tasks.ForEach(z =>
                {
                    Object.defineProperty(z, "Status", { get: () => Tasks.TaskStatus.WaitingToRun, configurable: true });
                    this.Pending.push(z);
                });

                this.DequeueNext();             
            }

            public RemovePendingTask(task: Tasks.ITask<any, any>)
            {
                if (task == null) return;

                // find in pending
                var taskEntry = this.Pending.Select((z, i) => ({ Task: z, Index: i })).Where(z => z.Task === task).FirstOrNull();

                if (taskEntry != null)
                    this.Pending.splice(taskEntry.Index, 1);
                else
                {
                    // find in work queue
                    var activeQ = this.Workers.Where(z => z.Task === task).FirstOrNull();

                    if (activeQ != null)
                    {
                        if (activeQ.IsBusy) // should always be the case
                        {
                            var me = this;
                            var timeoutAction = () =>
                                                {
                                                    if (activeQ.Worker != null)
                                                    {
                                                        activeQ.Worker.terminate();
                                                        if (activeQ.Task != null && activeQ.Task.Exception == null)
                                                            (activeQ.Task as any)["Exception"] =  new Tasks.TaskAbortException();
                                                    }
       
                                                    me.workers = me.Workers.Where(z => z != activeQ).ToList();
       
                                                    me.ActiveWorkers -= 1;
                                                };

                            var timer = setTimeout(timeoutAction, TaskSchedulerQueue.CANCEL_TIMEOUT);
                            
                            var timerResolver = () => clearTimeout(timer); activeQ.Task = null;

                            var fakeTask = {}

                            Object.defineProperty(fakeTask, "Result", { get: () => undefined, set: (value) => timerResolver() });
                            Object.defineProperty(fakeTask, "Exception", { get: () => undefined, set: (value) => timerResolver() });

                            activeQ.Task = fakeTask as any; // softkill by ignoring the result as it is assumed the activity in the Worker to be synchronous

                        }
                        else if (activeQ != null)
                        {
                            activeQ.Task = null;   
                        }                        

                        activeQ.Worker.postMessage("Abort");
                    }
                }
                
                this.DequeueNext();
            }            

            private get MaxParallelismForChildren()
            {
                return this.ActiveWorkers >= Tasks.Config.MaxParallelism
                       ? 0
                       : Math.floor(Math.sqrt(Tasks.Config.MaxParallelism - this.ActiveWorkers));
            }            

            public DequeueNext()
            {
                if (!ScriptHandler.ScriptsObtained())
                {
                    var me = this;
                    ScriptHandler.GetScriptContents(() =>
                    {
                        me.DequeueNext();
                    });
                    return;
                }

                /*
                // Logging - - - - -
                if (this.ActiveWorkers == 0)
                {
                    if (self["LastTaskIdle"] != null)
                    {
                        var msg = Date.now() - self["LastTaskIdle"];
                        var me = this;
                        var logMsg = () =>
                        {
                            if (me.Pending.length == 0)
                                console.log("Task Scheduler - worked for", msg);
                            else
                                setTimeout(logMsg, 3000);
                        }
                        
                        setTimeout(logMsg, 3000);
                    }                        

                    self["LastTaskIdle"] = null;

                    if (this.Pending.length > 0)
                        self["LastTaskIdle"] = Date.now();
                }
                    */

                var need = this.Pending.length;

                if (need == 0) return;
    
                //there may not be any room for parallelisation, or it does not pay-off to run in parallel
                if (Queue.RunInSync)
                {                
                    var nextTask = this.Pending.shift();
                    var me = this;

                    var hasReturned = false;

                    if (self["WebWorkerUtil"] == null)
                        self["WebWorkerUtil"] = WebWorkerUtil;

                    WebWorkerUtil.WorkOnSequenceOfActivities(nextTask.Activities.Actions, nextTask.Activities.InputArguments, (result, exception) =>
                    {
                        if (hasReturned) // done async
                        {
                            if (exception != null)
                                (nextTask as any).Exception = exception as Accelatrix_Base.Exception;
                            else
                                (nextTask as any).Result = result;
                        }
                        else
                            setTimeout(() =>
                            {
                                if (exception != null)
                                    (nextTask as any).Exception = exception as Accelatrix_Base.Exception;
                                else
                                    (nextTask as any).Result = result;
        
                                me.DequeueNext();
                            }, 0);
                    });

                    hasReturned = true;
                    return;
                }
    
                var capacity = Tasks.Config.MaxParallelism - this.ActiveWorkers;
    
                if (capacity <= 0) return;
    
                var elected = Accelatrix_Enumerable.Collections.Enumerable.Range(0, need <= capacity ? need : capacity)
                                                                          .Select(z => this.GetWorker())
                                                                          .TakeWhile(z => z != null)
                                                                          .ToList();
    
                if (elected.length == 0) return;
    
                this.ActiveWorkers += elected.length;
    
                elected.ForEach(z =>
                {
                    z.Task = this.Pending.shift();
    
                    if (z.Task == null)
                        z.IsBusy = false;
                    else
                        this.AssignWork(z);
                });
            }

            private GetWorker(): { Worker: Worker, Task: Tasks.ITask<any, any>, IsBusy: boolean, Culture: Accelatrix_Globalization.Globalization.ILocaleFormatInfo, Id: number, NestingLevel: number }
            {
                var available = this.Workers.Where(z => z.Worker != null)
                                            .Where(z =>
                                                {
                                                        var isBusy = z.IsBusy;
                                                        if (isBusy == false)
                                                        {
                                                            z.IsBusy = true; //reserve worker already
                                                        }
                                                        return isBusy == false; //isBusy == null are for workers that have been cancelled
                                                })
                                            .FirstOrNull();

                if (available != null) return available;

                var me = this;

                if (this.Workers.length < Tasks.Config.MaxParallelism) //Create and wire new worker
                {
                    var newWorker = { Worker: SpawnWorker(), Task: null as Tasks.ITask<any, any>, IsBusy: true, Culture: null, Id: workerId, NestingLevel: self["__WebWorkerNestingLevel__"] == null ? 0 : self["__WebWorkerNestingLevel__"] };

                    newWorker.Worker.onmessage = message =>
                    {                        
                        //Received result

                        // StatefulActivity messages
                        if (this.StatefulActivityMessages(message.data, newWorker.Worker, newWorker.Id))
                            return;

                        // WorkloadResult handling

                        var theTask = newWorker.Task as Tasks.ITask<any, any>;
                        var theMessage = theTask == null
                                         ? null
                                         : typeof message.data == "string"
                                           ? Accelatrix_Serialization.Serialization.FromJSON(message.data)
                                           : message.data as Object;

                        var theResponse = theMessage as WebWorkerUtil.WorkloadResult;
                        var theResult = theResponse == null ? null : theResponse.Result;

                        if (theTask != null && theResponse.ResultRetained) // need to send the next batch
                        {
                            this.AssignWork(newWorker);
                            return;
                        }

                        setTimeout(() =>
                        {
                            if (theTask != null)
                                (theTask as any).Result = theResult; 
                        }, 0);

                        if (theTask != null)
                        {
                            newWorker.Task = null;    
                            me.ActiveWorkers -= 1;                            
                        }
    
                        newWorker.IsBusy = newWorker.IsBusy == null //cancelled worker
                                           ? null
                                           : false;
    
                        me.DequeueNext();
                    };

                    newWorker.Worker.onerror = exception =>
                    {
                        if (newWorker.Task != null)
                        {
                            var theTask = newWorker.Task as any;

                            setTimeout(() =>
                            {
                                if (theTask != null)
                                    theTask.Exception = exception.error == null ? new Tasks.TaskException(exception.message) : exception.error;
                            }, 0);

                            newWorker.Task = null as any;
                        }

                        newWorker.IsBusy = false;

                        me.ActiveWorkers -= 1;
                        
                        me.DequeueNext();
                    };

                    this.Workers.push(newWorker);

                    return newWorker as any;
                }

                return null as any;                
            }

            private AssignWork(worker: { Worker: Worker, Task: Tasks.ITask<any, any>, IsBusy: boolean, Culture: Accelatrix_Globalization.Globalization.ILocaleFormatInfo })
            {
                Object.defineProperty(worker.Task, "Status", { get: () => Tasks.TaskStatus.Running, configurable: true });
                worker.IsBusy = true;
    
                let task = worker.Task;
                let isEnumerationOfActions = task.Activities != null && task.Activities.Actions != null && !task.Activities.Actions.GetType().IsArray;
                let actions : Array<Tasks.TaskActivity<any, any>>;

                if (isEnumerationOfActions)
                {
                    let myActions = task.Activities.Actions.Freeze();                        

                    actions = myActions.Take(TaskSchedulerQueue.NUMBER_OF_BUFFERED_ACTIONS).ToList();

                    if (actions.length < TaskSchedulerQueue.NUMBER_OF_BUFFERED_ACTIONS || !myActions.Any())
                        isEnumerationOfActions = false; // set is too small to buffer
                }
                else
                {
                    actions = task.Activities.Actions.ToList();
                }

                let workload = new WebWorkerUtil.Workload(actions,
                                                          task.Activities.InputArguments,
                                                          !isEnumerationOfActions,
                                                          this.MaxParallelismForChildren,
                                                          TaskScheduler.config.DataPassingMethod,
                                                          worker.Culture == Accelatrix_Globalization.Globalization.DefaultFormatting
                                                            ? null
                                                            : Accelatrix_Globalization.Globalization.DefaultFormatting);

                worker.Culture = Accelatrix_Globalization.Globalization.DefaultFormatting;

                worker.Worker.postMessage(workload.AsMessage(), null);
            }

            private StatefulActivityMessages(msg: string | object, worker: Worker, workerId: number)
            {
                if (msg == null) return false;

                var messageType = null;

                if (typeof msg == "string")
                {
                    if (msg.indexOf('"$type":"WebWorkerUtil.StatefulActivity') < 0)
                        return false;
                }
                else
                {
                    messageType = msg.GetType();
                    if (messageType.Name.indexOf('StatefulActivity') < 0 && (messageType.Alias == null || messageType.Alias.indexOf('StatefulActivity') < 0))
                        return false;
                }

                var message = typeof msg == "string"
                              ? Accelatrix_Serialization.Serialization.FromJSON(msg as string)
                              : msg as Object;
                              
                if (messageType == null)
                    messageType = message.GetType();
    
                if (messageType.Name == WebWorkerUtil.StatefulActivityWriteRequest.name || messageType.Alias == WebWorkerUtil.StatefulActivityWriteRequest.name || (messageType.Alias != null && messageType.Alias.indexOf("." + WebWorkerUtil.StatefulActivityWriteRequest.name) > 0))
                {
                    var writeRequest = message as WebWorkerUtil.StatefulActivityWriteRequest;
                    
                    if (writeRequest.Append)
                        StatefulActivityHandler.PushSync(writeRequest.Id, writeRequest.Data, null);
                    else
                        StatefulActivityHandler.SetSync(writeRequest.Id, writeRequest.Data, null);
    
                    return true;
                }
                else if (messageType.Name == WebWorkerUtil.StatefulActivityReadRequest.name || messageType.Alias == WebWorkerUtil.StatefulActivityReadRequest.name || (messageType.Alias != null && messageType.Alias.indexOf("." + WebWorkerUtil.StatefulActivityReadRequest.name) > 0))
                {
                    var readRequest = message as WebWorkerUtil.StatefulActivityReadRequest;
                    var result: any = null;

                    try
                    {
                        result = StatefulActivityHandler.ReadSync(readRequest.Id);    
                    }
                    catch(ex)
                    {
                        result = ex;
                    }

                    var readResponse = new WebWorkerUtil.StatefulActivityReadResponse(readRequest.Id, readRequest.RequestId, result);
                    worker.postMessage(Accelatrix_Serialization.Serialization.ToJSON(readResponse), null);

                    return true;
                }
                else if (messageType.Name == WebWorkerUtil.StatefulActivityReadAndPushRequest.name || messageType.Alias == WebWorkerUtil.StatefulActivityReadAndPushRequest.name || (messageType.Alias != null && messageType.Alias.indexOf("." + WebWorkerUtil.StatefulActivityReadAndPushRequest.name) > 0))
                {
                    var readAndPushRequest = message as WebWorkerUtil.StatefulActivityReadAndPushRequest;
    
                    var entry = StatefulActivityHandler.Get(readAndPushRequest.Id);
                    
                    if (entry != null)
                    {
                        var data = entry.Data == null
                                   ? []
                                   : entry.Data;

                        try
                        {                            
                            var dataToPush = readRequest.Transform == null
                                             ? readRequest.Transform(readAndPushRequest.Data)
                                             : readAndPushRequest.Data;
    
                            if (entry.Data == null)
                                entry.Data = [ dataToPush ];
                            else
                                entry.Data.push(dataToPush);
                        }
                        catch(ex)
                        {
                            data = ex; // send the exception upwards
                        }
    
                        var readResponse = new WebWorkerUtil.StatefulActivityReadResponse(readRequest.Id, readRequest.RequestId, data);
                        worker.postMessage(Accelatrix_Serialization.Serialization.ToJSON(readResponse), null);
                    }
    
                    return true;
                }
                else if (messageType.Name == WebWorkerUtil.StatefulActivityPushAndEvaluateRequest.name || messageType.Alias == WebWorkerUtil.StatefulActivityPushAndEvaluateRequest.name || (messageType.Alias != null && messageType.Alias.indexOf("." + WebWorkerUtil.StatefulActivityPushAndEvaluateRequest.name) > 0))
                {
                    var pushAndEvaluateRequest = message as WebWorkerUtil.StatefulActivityPushAndEvaluateRequest;
    
                    var entry = StatefulActivityHandler.Get(pushAndEvaluateRequest.Id);
                    
                    if (entry != null)
                    {
                        var myResultingExpression: any;

                        try
                        {
                            myResultingExpression = pushAndEvaluateRequest.Predicate(entry.Data == null ? [] : entry.Data, pushAndEvaluateRequest.Data, pushAndEvaluateRequest.Id);
    
                            if (entry.Data == null)
                                entry.Data = [ pushAndEvaluateRequest.Data ];
                            else
                                entry.Data.push(pushAndEvaluateRequest.Data);                                  
                        }
                        catch(ex)
                        {
                            myResultingExpression = ex; // send the exception upwards
                        }

                        var evaledResponse = new WebWorkerUtil.StatefulActivityEvaluateResponse(pushAndEvaluateRequest.Id, pushAndEvaluateRequest.RequestId, myResultingExpression);
                        worker.postMessage(Accelatrix_Serialization.Serialization.ToJSON(evaledResponse), null);
                    }
    
                    return true;
                }                
                else if (messageType.Name == WebWorkerUtil.StatefulActivityReadResponse.name || messageType.Alias == WebWorkerUtil.StatefulActivityReadResponse.name || (messageType.Alias != null && messageType.Alias.indexOf("." + WebWorkerUtil.StatefulActivityReadResponse.name) > 0))
                {
                    // do not do anything as the promise object is listerning as well and will do the needful
                    return true;
                }
                else if (messageType.Name == WebWorkerUtil.StatefulActivityEvaluateResponse.name || messageType.Alias == WebWorkerUtil.StatefulActivityEvaluateResponse.name || (messageType.Alias != null && messageType.Alias.indexOf("." + WebWorkerUtil.StatefulActivityEvaluateResponse.name) > 0))
                {
                    // do not do anything as the promise object is listerning as well and will do the needful
                    return true;
                }
    
                return false;
            }   

            public CancelAll()
            {                
                this.Pending.ForEach(z => z.Cancel());                
                this.Workers.Where(z => z.IsBusy).ForEach(z => z.Task.Cancel());
            }
    
            public KillAll()
            {
                this.pending = [];
                this.Workers.Where(z => z.Worker != null).ForEach(z => z.Worker.terminate());
                this.workers = [];
                this.ActiveWorkers = 0;
            }
            
            public Broadcast(msg: any, exceptedTo?: Array<number>)
            {
                if (msg == null) return;

                var whatToPost = msg.GetType().Name == "String" ? msg as string : Accelatrix_Serialization.Serialization.ToJSON(msg);

                this.Workers
                    .Where(z => exceptedTo == null
                                ? true
                                : exceptedTo.NotContains(z.Id))
                    .ForEach(z => z.Worker.postMessage(whatToPost));
            }
        };

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(config.constructor, "name", { get: () => "TasksConfig" });             
        Object.defineProperty(Queue.constructor, "name", { get: () => "TaskSchedulerQueue" });            
    }

    namespace ScriptHandler
    {
        export const scriptSources = BuildScriptSourcesCollection();
        var scriptContents: Array<string> = undefined;

        export function ScriptsObtained()
        {
            return scriptContents != null;
        }

        export function ScriptContents()
        {
            return scriptContents == null ? "" : scriptContents.Select((z, i) => i == 0 // Make GetHashCode(true) in Web Workers
                                                                                 ? z.replace("1!=persistHashCode", "1!=true").replace("persistHashCode == true", "true == true")
                                                                                 : z)
                                                               .ToList()
                                                               .join("\n");
        }

        function OnScriptSourcesChanged()
        {
            if (scriptContents == null) return; // loading
            scriptContents = undefined;
        }

        function GetAccelatixScript(): { SourceType: Tasks.TaskScriptSource, Contents: string }
        {
            if (TaskScheduler.IsNested()) return;

            var accelatrixLocation: HTMLScriptElement;

            try
            {
                accelatrixLocation = document.currentScript as HTMLScriptElement;
            }
            catch(ex)
            {
                // in Web Worker
            }

            if (accelatrixLocation == null) // highly irregular
            {
                try
                {
                    let scripts = document.querySelectorAll("script");
                
                    for (var i = 0; i < scripts.length; i++)
                    {
                        if (scripts[i].getAttribute("src") != null && scripts[i].getAttribute("src").toLocaleLowerCase().indexOf("accelatrix") >= 0)
                            return { SourceType: Tasks.TaskScriptSource.Url, Contents: scripts[i].getAttribute("src") };
                        else if (scripts[i].innerText != null && scripts[i].innerText.indexOf("Accelatrix") >= 0)
                            return { SourceType: Tasks.TaskScriptSource.PlainText, Contents: scripts[i].innerText };
                    }                    
                }
                catch (ex)
                {
                    // in Web Worker
                }

                // throw new Accelatrix_Base.Exception("Could not initialize Accelatrix.Tasks since the <script> element hosting Accelatrix could not be determined.\nPlease add it manually to Accelatrix.Tasks.Scripts.");
                return { SourceType: Tasks.TaskScriptSource.Url, Contents: "https://ferreira-family.org/accelatrix/accelatrix.min.js" };
            }

            if (accelatrixLocation.innerText != null && accelatrixLocation.innerText.indexOf("Accelatrix") >= 0)
                return { SourceType: Tasks.TaskScriptSource.PlainText, Contents: accelatrixLocation.innerText };            
            else if (accelatrixLocation.getAttribute("src") != null)
                return { SourceType: Tasks.TaskScriptSource.Url, Contents: accelatrixLocation.getAttribute("src") };

            // throw new Accelatrix_Base.Exception("Could not initialize Accelatrix.Tasks since the <script> element hosting Accelatrix could not be determined.\nPlease add it manually to Accelatrix.Tasks.Scripts.");            
            return { SourceType: Tasks.TaskScriptSource.Url, Contents: "https://ferreira-family.org/accelatrix/accelatrix.min.js" };
        }

        function BuildScriptSourcesCollection()
        {
            if (TaskScheduler.IsNested())
            {
                var result = self["__WebWorkerScripts__"];
                Object.defineProperty(result, "push", { enumerable: false, value: () => {} }); // do not receive
                return result;
            }

            var result: { SourceType: Tasks.TaskScriptSource, Contents: string }[] = [ GetAccelatixScript() ];

            var originalPush = result.push.bind(result);
            Object.defineProperty(result, "push", { enumerable: false, value: (entry: { SourceType: Tasks.TaskScriptSource, Contents: string }) =>
            {
                if (entry != null && !String.IsNullOrWhiteSpace(entry.SourceType) && !String.IsNullOrWhiteSpace(entry.Contents))
                {                    
                    originalPush(entry);
                    OnScriptSourcesChanged();
                }
            }});

            return result;
        }

        function GetScripts(callback: () => void, fromIndex?: number)
        {
            if (!(scriptContents === undefined))
            {
                return; // done or doing
            }

            scriptContents = null;

            var sourceCount = scriptSources.length;
            var result = [];

            var checkEnded = () =>
            {
                if (result.length >= sourceCount) // all loaded
                {
                    if (result.length < scriptSources.length) // more added in the meantime
                    {
                        let fromIndex = sourceCount;                        
                        sourceCount = scriptSources.length;
                        loadScripts(fromIndex);
                    }
                    else
                    {
                        scriptContents = result.OrderBy(z => z.Index).Select(z => z.Contents).ToList();
    
                        if (callback != null)
                            callback();
                    }
                }
            };

            var loadScripts = (fromIndex: number) =>
                              {
                                scriptSources.Skip(fromIndex)
                                             .ForEach((z, i) =>
                                                      {
                                                        if (z.SourceType == Tasks.TaskScriptSource.PlainText)
                                                            result.push({ Index: fromIndex + i, Contents: fromIndex + i == 0 ? UnpackJustAccelatrix(z.Contents) : z.Contents });
                                                        else
                                                        {                                                            
                                                            GetData(z.Contents, true, (r, e) =>
                                                            {
                                                                if (e != null)
                                                                    throw new Error(e);

                                                                result.push({ Index: fromIndex + i, Contents: fromIndex + i == 0 ? UnpackJustAccelatrix(r) : r });

                                                                checkEnded();
                                                            });
                                                        }
                                                      })

                                checkEnded();
                              }

            loadScripts(0);
        }

        function UnpackJustAccelatrix(contents: string): string
        {
            if (contents == null) return "";
            
            let start = contents.indexOf('var Accelatr' + 'ix,__extends='); // prod
            if (start < 0)
                start = contents.indexOf('var __ext' + 'ends = (this'); // dev;

            if (start < 0)
                return contents;

            let endString = ';if("object"==typeof module&&"object"==typeof module.exports)module.exports=Accelatrix;Accelatrix.__esModule=Accelatrix;Accelatrix.Accelatrix=Accelatrix;if(self==null){self={}};self["Accelatrix"]=Accelatrix;';
            let end = endString.length + contents.lastIndexOf(endString);

            return end < endString.length
                   ? contents
                   : contents.substring(start, end);
        }

        function GetData(url: string, cache: boolean, callback: (result: string, error: any) => void): void
        {
            var xmlhttp;

            try
            {
                xmlhttp = self["XMLHttpRequest"] != null
                          ? new XMLHttpRequest()
                          : new self["ActiveXObject"]("Microsoft.XMLHTTP");
            }
            catch (e)
            {
                callback(null, e);
                return;
            }

            xmlhttp.onreadystatechange = function ()
            {
                if (xmlhttp == null) return; //page is being destroyed

                if (xmlhttp.readyState == XMLHttpRequest.DONE)
                {
                    if (xmlhttp.status == 200)
                    {
                        callback(xmlhttp.responseText, null);
                    }
                    else
                    {
                        var errorObj;
                        try
                        {
                            errorObj = JSON.parse(xmlhttp.responseText);
                        }
                        catch (e)
                        {
                            errorObj = xmlhttp.responseText;
                        }

                        callback(null, errorObj);
                    }
                }
            };

            if (!cache) url += "?_" + Math.random();

            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        }

        export function GetScriptContents(callback: (contents: string) => void)
        {
            if (scriptContents != null && scriptContents.length > 0)
            {
                if (callback != null)
                    callback(scriptContents.join("\n"))
            }
            else
                GetScripts(() => {
                                    if (callback != null)
                                        callback(scriptContents.join("\n"))
                                 });
        }
    }
    
    namespace StatefulActivityHandler
    {
        const DEFAULT_BUFFER_SIZE_FOR_STREAM_STATEFUL_ACTIVITIES = 5000; //5000; // for example, Distinct in parallel. How many elements are pulled from the sequence in one go to check Distinct across current threads.

        export var Sequence = 0;

        var StatefulActivities : Array<{ Id: string, Data: any }> = [];

        export function Get(id: string)
        {
            return StatefulActivities.Where(z => z.Id == id)
                                     .FirstOrNull();
        }

        export function Drop(id: string)
        {
            StatefulActivities = StatefulActivities.Where(z => z.Id != id).ToList();
        }

        export function Create(instance: Tasks.StatefulActivity<any>)
        {
            if (StatefulActivities.Where(z => z.Id == instance.Id).Any()) return;

            var newEntry = { Id: instance.Id, Data: null };
            StatefulActivities.push(newEntry);
        }

        export function Execute<T>(structure: { Id: string, Members: Array<{ Op: string, Args: any[] }> }, data: T) : Accelatrix_Async.Async.IChainablePromise<T>
        {
            // failsafe
            if (structure == null || structure.Members == null || !structure.Members.Any())
                return Accelatrix_Async.Async.AsPromise(data);
            
            var resolver: (result: T) => void = null;
            var rejector: (ex: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
            var finalizer: () => void = null;
            var canceller = { 
                                Cancel: (ex?: Accelatrix_Base.Exception) => { 
                                                                              fireExecution = () => {};
                                                                              doActivity(null, ex != null ? ex : new Tasks.TaskAbortException());
                                                                            }
                            };
            var fireExecution = () => { };

            var myPromise = new StatefulActivityPromise<T>(canceller,
                                                           (newResolver) => { resolver = newResolver; fireExecution() },
                                                           (newRejector) => { rejector = newRejector; },
                                                           (newFinalizer) => { finalizer = newFinalizer; fireExecution() });

            var entry = Get(structure.Id);
            var isBaseThread = entry != null; // otherwise runs in Web Worker
            var currentActivityIndex = 0;
            var result = data;

            var doActivity = (newData: any, exception: Accelatrix_Base.Exception) =>
            {
                if (WebWorkerUtil.IsPromise(newData))
                {
                    (newData as Promise<any>).catch(ex => doActivity(null, ex))
                                             .then(z => doActivity(z, null))

                    if (newData["Cancel"] != null && newData["Cancel"] instanceof Function)
                        canceller.Cancel = newData.Cancel;

                    return;
                }
                else
                    canceller.Cancel = () => { };

                if (exception != null)
                {
                    canceller.Cancel = () => { };

                    try
                    {
                        if (rejector != null) rejector(exception);                        
                    }
                    catch(ex)
                    {                        
                    }
                    finally
                    {
                        if (finalizer != null) finalizer();
                        rejector = null;
                        resolver = null;
                        finalizer = null;                        
                    }

                    return;
                }

                result = newData;

                if (currentActivityIndex <= structure.Members.length - 1)
                {
                    currentActivityIndex++;
                    DoActivity(canceller, structure.Id, structure.Members[currentActivityIndex - 1].Op, structure.Members[currentActivityIndex - 1].Args, result, isBaseThread, doActivity);                
                }
                else
                {
                    try
                    {
                        if (resolver != null) resolver(result);
                    }
                    catch(ex)
                    {  
                        if (rejector != null) rejector(ex);                      
                    }
                    finally
                    {
                        if (finalizer != null) finalizer();
                        rejector = null;
                        resolver = null;
                        finalizer = null;
                    }
                }
            };

            fireExecution = () =>
            {
                doActivity(data, null);
                fireExecution = () => { };
            };

            return myPromise as any;
        }

        function DoActivity(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, op: string, args: Array<any>, data: any, isBaseThread: boolean, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            if (op == "Read")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, ReadSync, [id], callback);
                else
                    ReadAsync(canceller, id, callback);
            }
            else if (op == "ConcatRead")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, ConcatReadSync, [id, data], callback);
                else
                    ConcatReadAsync(canceller, id, data, callback);
            }
            else if (op == "PushAndEvaluate")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, PushAndEvaluateSync, [id, data, args[0], args[1]], callback);
                else
                    PushAndEvaluateAsync(canceller, id, data, args[0], args[1], callback);
            }
            else if (op == "StreamPushAndEvaluate")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, PushAndEvaluateSync, [id, data, args[0], args[1]], callback);
                else
                    StreamPushAndEvaluateAsync(canceller, id, data, args[0], args[1], args[2], args[3], callback);
            }            
            else if (op == "Push")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, PushSync, [id, data, args[0]], callback);
                else
                    PushAsync(canceller, id, data, args[0], callback);
            }
            else if (op == "Set")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, SetSync, [id, data, args[0]], callback);
                else
                    SetAsync(canceller, id, data, args[0], callback);
            }
            else if (op == "ReadAndPush")
            {
                if (isBaseThread)
                    DoSyncActivity(canceller, ReadAndPushSync, [id, data, args[0]], callback);
                else
                    ReadAndPushAsync(canceller, id, data, args[0], callback);
            }
        }

        function DoSyncActivity(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void}, func: Function, args: Array<any>, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var result: any;
            var exception: Accelatrix_Base.Exception;

            var originalCancel = canceller.Cancel;

            canceller.Cancel = () =>
            {
                canceller.Cancel = () => {};
                exception = new Tasks.TaskAbortException();
                result = null;
            }

            try
            {
                result = func.apply(undefined, args);
            }
            catch(ex)    
            {
                exception = ex;
            }

            //setTimeout(() =>
            //{
                canceller.Cancel = originalCancel;
                callback(result, exception);
            //}, 0);
        }

        function PostAndListen(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, message: { Id: string, RequestId: string }, callback: (data: any, exception: Accelatrix_Base.Exception) => void)
        {
            if (message == null) throw new Accelatrix_Base.ArgumentNullException("message");
            if (String.IsNullOrWhiteSpace(message.Id)) throw new Accelatrix_Base.ArgumentException("message", "Message needs an Id.");
            if (String.IsNullOrWhiteSpace(message.RequestId)) throw new Accelatrix_Base.ArgumentException("message", "Message needs a RequestId.");

            var originalCancel = canceller.Cancel;

            canceller.Cancel = (ex?: Accelatrix_Base.Exception) =>
                                {
                                    self.removeEventListener("message", onMessage);
                                    canceller.Cancel = originalCancel;
                                    callback(null, ex != null ? ex : new Tasks.TaskAbortException());
                                }            

            var onMessage = function (e: MessageEvent)
            {
                if (e.data == null) return;

                var responseObject: { Id: string, RequestId: string, Data: any, Result: any } = null;

                if (typeof e.data == "string")
                {
                    if (String.IsNullOrWhiteSpace(e.data))
                        return; // not for me                
    
                    if (e.data.indexOf('"' + message.Id + '"') < 0 || e.data.indexOf('"' + message.RequestId + '"') < 0)
                        return; // not for me                
    
                    try
                    {
                        responseObject = Accelatrix_Serialization.Serialization.FromJSON(e.data);   
                    }
                    catch(ex)
                    {
                        self.removeEventListener("message", onMessage);
                        canceller.Cancel = originalCancel;
                        callback(null, ex);
                    }
                }
                else
                    responseObject = e.data;

                if (responseObject.Id != message.Id || responseObject.RequestId != message.RequestId)
                    return; // not for me;

                self.removeEventListener("message", onMessage);
                canceller.Cancel = originalCancel;

                if (responseObject.Data instanceof Error)
                    callback(null, responseObject.Data as Accelatrix_Base.Exception);
                else if (responseObject.Result instanceof Error)
                    callback(null, responseObject.Result as Accelatrix_Base.Exception);                
                else if (responseObject.Data != null)
                    callback(responseObject.Data, null)
                else
                    callback(responseObject.Result, null);
            };

            self.addEventListener("message", onMessage);

            try
            {
                self.postMessage(Accelatrix_Serialization.Serialization.ToJSON(message), null);
            }
            catch(ex)
            {
                callback(null, ex as any);
                self.removeEventListener("message", onMessage);
                canceller.Cancel = originalCancel;                
            }
        }

        class StatefulActivityPromise<T> implements Accelatrix_Async.Async.IChainablePromise<T>
        {    
            constructor(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void}, changeResolver: (resolver: (result: T) => void) => void, changeRejector: (rejector: (exception: Error) => void) => void, changeFinallizer: (finalizer: () => void) => void)
            {
                Object.defineProperty(this, "Cancel", { enumerable: false, configurable: false, value: () =>
                {
                    canceller.Cancel();
                }});
    
                Object.defineProperty(this, "then", { enumerable: false, configurable: false, value: (onfulfilled: (value: T) => void) =>
                {
                    changeResolver(onfulfilled);
                    return this;
                }});
    
                Object.defineProperty(this, "Then", { enumerable: false, configurable: false, value: (onfulfilled: (value: T) => void) =>
                {
                    changeResolver(onfulfilled);
                    return this;
                }});
    
                Object.defineProperty(this, "catch", { enumerable: false, configurable: false, value: (onrejected: (exception: Accelatrix_Base.Exception) => void) =>
                {
                    changeRejector(onrejected);
                    return this;
                }});
    
                Object.defineProperty(this, "Catch", { enumerable: false, configurable: false, value: (onrejected: (exception: Accelatrix_Base.Exception) => void) =>
                {
                    changeRejector(onrejected);
                    return this;
                }});
    
                Object.defineProperty(this, "Finally", { enumerable: false, configurable: false, value: (onFinished: () => void) =>
                {
                    changeFinallizer(onFinished);
                    return this;
                }});
                
                Object.defineProperty(this, "ContinueWith", { value: (continueWith: (result: T) =>any, merge?: boolean) =>
                { 
                    return Accelatrix_Async.Async.Chain(this, continueWith as any, merge);
                }});                
            }
            
            public Then(onfulfilled: (value: T) => void)
            {
                return this as any;
            }
    
            public then(onfulfilled: (value: T) => void)
            {
                return this as any;
            }
    
            public Catch(onrejected: (exception: Accelatrix_Base.Exception) => void)
            {
                return this as any;
            }
    
            public catch(onrejected: (exception: Accelatrix_Base.Exception) => void)
            {
                return this as any;
            }
    
            public Cancel()
            {
                return this as any;
            }
    
            public Finally(callback: () => void)
            {
                return this as any;
            }

            /**
             * Chains a promise with a follow-up action and returns a new promise.
             * @param promise The promise to chain.
             * @param continueWith The follow-up action.
             * @returns Returns a chained promise.
             */            
            public ContinueWith<TOut>(continueWith: (result: T) => TOut): Accelatrix_Async.Async.IChainablePromise<TOut>;
            /**
             * Chains a promise with a follow-up action and returns a new promise.
             * @param promise The promise to chain.
             * @param continueWith The follow-up action that produces another promise.
             * @param merge If the newly produced promise should be merged into the original.
             * @returns Returns a chained promise.
             */            
            public ContinueWith<TOut>(continueWith: (result: T) => Accelatrix_Async.Async.ICancellablePromise<TOut>, merge?: boolean): Accelatrix_Async.Async.IChainablePromise<TOut>
            {
                return this as any;
            }            
        }

        export function ReadSync(id: string)
        {
            var result = Get(id);

            return result.Data == null
                   ? []
                   : result.Data;
        }

        function ReadAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var msgId = Date.now().toString() + self["__WebWorkerId__"];
            var msg = new WebWorkerUtil.StatefulActivityReadRequest(id, msgId, null);

            PostAndListen(canceller, msg, callback);
        }

        export function ConcatReadSync(id: string, data: any)
        {
            var result = Get(id);

            return result.Data == null
                   ? [].concat(data)
                   : result.Data.concat(data);
        }

        function ConcatReadAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, data: any, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var msgId = Date.now().toString() + self["__WebWorkerId__"];
            var msg = new WebWorkerUtil.StatefulActivityReadRequest(id, msgId, null);            

            PostAndListen(canceller, msg, (r, ex) =>
            {
                if (ex != null)
                    callback(null, ex);
                else
                    callback(r == null ? data : r.concat(data), null);
            });
        }

        function PushAndEvaluateSync(id: string, data: any, dataTransform: ((data: any) => any), evaluator: (accumulatedData: Array<any>, newData: any) => ((data: any) => any))
        {
            var entry = Get(id);
            var existingData = entry.Data == null
                               ? null
                               : entry.Data;

            if (existingData == null)
            {
                entry.Data = [];
                existingData = [];
            }                

            var dataToPush = dataTransform == null
                             ? data
                             : dataTransform(data);

            entry.Data.push(dataToPush);

            var expression = evaluator == null
                             ? z => z
                             : evaluator(existingData, dataToPush);

            return expression(data);
        }

        function PushAndEvaluateAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, data: any, dataTransform: ((data: any) => any), evaluator: (accumulatedData: Array<any>, newData: any, statefulActivityId?: string) => ((data: any) => any), callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var msgId = Date.now().toString() + self["__WebWorkerId__"];

            var isEnumerable = data != null && data.Any != null;

            if (isEnumerable) data = data.Freeze();

            var untransformedDataToPost = isEnumerable
                                          ? data.ToList()
                                          : data;

            var untransformedDataToPostIsPromise = WebWorkerUtil.IsPromise(untransformedDataToPost);

            var dataToPost = dataTransform == null
                             ? untransformedDataToPost
                             : !untransformedDataToPostIsPromise
                               ? dataTransform(untransformedDataToPost)
                               : Accelatrix_Async.Async.Chain(untransformedDataToPost as PromiseLike<any>,
                                                              z =>
                                                              { 
                                                                  untransformedDataToPost = z;
                                                                  return dataTransform(z)
                                                              });

            var onResult = (result: Function, ex: Accelatrix_Base.Exception) =>
                           {
                              if (ex != null)
                                callback(null, ex);
                              else
                              {
                                var resultingData = result == null
                                                    ? data
                                                    : result(untransformedDataToPost);
                                
                                callback(resultingData, null);
                              }
                           };

            var post = (dataToSendToWebWorker?: any) =>
                       {
                            // commit enumerable or asynenumerable
                            if (dataToSendToWebWorker != null && dataToSendToWebWorker.Any)
                                dataToSendToWebWorker = dataToSendToWebWorker.ToList();

                            // wait on promises
                            if (WebWorkerUtil.IsPromise(dataToSendToWebWorker))
                            {
                                dataToSendToWebWorker.catch(ex => onResult(null, ex))
                                                     .then(z => post(z));
                                return;
                            }

                            var msg = new WebWorkerUtil.StatefulActivityPushAndEvaluateRequest(id, msgId, evaluator, dataToSendToWebWorker);
                            
                            PostAndListen(canceller, msg, onResult);
                       }

            post(dataToPost);
        }   

        function StreamPushAndEvaluateAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, data: any, dataTransform: ((data: any) => any), evaluator: (accumulatedData: Array<any>, newData: any, statefulActivityId?: string) => ((data: any) => any), bufferSize: number, accumulated: Array<Promise<any> | any>, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        { 
            var msgId = Date.now().toString() + self["__WebWorkerId__"];
            
            if (bufferSize == null || bufferSize <= 0)
                bufferSize = DEFAULT_BUFFER_SIZE_FOR_STREAM_STATEFUL_ACTIVITIES;

            var isEnumerable = data != null && data.Any != null;

            if (isEnumerable) data = data.Freeze();

            var untransformedDataToPost = isEnumerable
                                          ? data.Take(bufferSize).ToList()
                                          : data;

            var untransformedDataToPostIsPromise = WebWorkerUtil.IsPromise(untransformedDataToPost);

            var hasMoreToServe = !isEnumerable
                                 ? false
                                 : !untransformedDataToPostIsPromise
                                   ? untransformedDataToPost.length >= bufferSize
                                   : true;

            var dataToPost = dataTransform == null
                             ? untransformedDataToPost
                             : !untransformedDataToPostIsPromise
                               ? dataTransform(untransformedDataToPost)
                               : Accelatrix_Async.Async.Chain(untransformedDataToPost,
                                                              z =>
                                                              {
                                                                untransformedDataToPost = z;

                                                                if (z.length != null && z.length < bufferSize)
                                                                    hasMoreToServe = false;

                                                                return dataTransform(z)
                                                              });

            var onResult = (result: Function, ex: Accelatrix_Base.Exception) =>
                           {
                                if (ex != null)
                                {
                                    callback(null, ex);
                                    return;
                                }

                                // ----------- Unpack, Accumulate and Return results ------------------------------

                                var resultingData = result == null
                                                    ? untransformedDataToPost
                                                    : result(untransformedDataToPost);

                                if (resultingData === undefined) hasMoreToServe = false;

                                if (!isEnumerable || !hasMoreToServe || accumulated != null)
                                {
                                    callback(resultingData, null);
                                    return;
                                }
                
                                accumulated = [];                

                                if (resultingData != null && resultingData.ForEach != null)
                                    resultingData.ForEach(z => accumulated.push(z));
                                else if (!(resultingData === undefined))
                                    accumulated.push(resultingData);

                                accumulated.push(getNextbatch(accumulated.length));

                                var asyncIteration = new Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable(accumulated);
                              
                                callback(asyncIteration, null);
                           };

            var post = (dataToSendToWebWorker?: any) =>
                       {
                            // commit enumerable or asynenumerable
                            if (dataToSendToWebWorker != null && dataToSendToWebWorker.Any)
                                dataToSendToWebWorker = dataToSendToWebWorker.ToList();

                            // wait on promises
                            if (WebWorkerUtil.IsPromise(dataToSendToWebWorker))
                            {
                                dataToSendToWebWorker.catch(ex => onResult(null, ex))
                                                     .then(z => post(z));
                                return;
                            }

                            let isEmpty = dataToSendToWebWorker == null || (dataToSendToWebWorker.Any != null && !dataToSendToWebWorker.Any());
                            let isEnd = isEmpty && (untransformedDataToPost == null || (dataToSendToWebWorker.Any != null && !untransformedDataToPost.Any()));

                            if (isEnd)
                            {
                                hasMoreToServe = false;
                                onResult(() => undefined, null);
                            }
                            else if (isEmpty)
                            {
                                hasMoreToServe = true;
                                onResult(z => z, null);
                            }
                            else
                            {
                                var msg = new WebWorkerUtil.StatefulActivityPushAndEvaluateRequest(id, msgId, evaluator, dataToSendToWebWorker);
                                PostAndListen(canceller, msg, onResult);
                            }                                                    
                       }            
            
            var getNextbatch = (position: number) =>
                               {
                                    var promise =  Accelatrix_Async.Async.Chain(Execute({ Id: id, Members: [ { Op: "StreamPushAndEvaluate", Args: [ dataTransform, evaluator, bufferSize, accumulated ] } ] }, data),
                                                                                r =>
                                                                                {        
                                                                                    if (r === undefined)
                                                                                    {
                                                                                        accumulated[position] = undefined;
                                                                                        return undefined;
                                                                                    }
                                                
                                                                                    if (r == null || r.Any == null)
                                                                                        accumulated[position] = r;
                                                                                    else if (!r.Any())
                                                                                        accumulated[position] = undefined;
                                                                                    else
                                                                                        r.ForEach((z, i) =>
                                                                                                {
                                                                                                    if (i == 0)
                                                                                                        accumulated[position] = z;
                                                                                                    else 
                                                                                                        accumulated.push(z);
                                                                                                });
                                                
                                                                                    accumulated.push(getNextbatch(accumulated.length));
                                                                                    return accumulated[position];
                                                                                });
                                    
                                    promise["Blocking"] = true;

                                    return promise;
                               };

            post(dataToPost);
        }  

        export function PushSync(id: string, data: any, dataTransform: (data: any) => any)
        {
            var entry = Get(id);

            var dataToPush = dataTransform == null
                             ? data
                             : dataTransform(data);

            if (entry.Data == null)
                entry.Data = [];

            entry.Data.push(dataToPush);

            return data;
        }

        function PushAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, data: any, dataTransform: (data: any) => any, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var isEnumerable = data != null && data.Any != null;

            if (isEnumerable) data = data.Freeze();

            var untransformedDataToPost = isEnumerable
                                          ? data.ToList()
                                          : data;

            var untransformedDataToPostIsPromise = WebWorkerUtil.IsPromise(untransformedDataToPost);

            var dataToPost = dataTransform == null
                             ? untransformedDataToPost
                             : !untransformedDataToPostIsPromise
                               ? dataTransform(untransformedDataToPost)
                               : Accelatrix_Async.Async.Chain(untransformedDataToPost as PromiseLike<any>,
                                                              z =>
                                                              { 
                                                                  untransformedDataToPost = z;
                                                                  return dataTransform(z)
                                                              });

            var post = (dataToSendToWebWorker?: any) =>
                       {
                            // commit enumerable or asynenumerable
                            if (dataToSendToWebWorker != null && dataToSendToWebWorker.Any)
                                dataToSendToWebWorker = dataToSendToWebWorker.ToList();

                            // wait on promises
                            if (WebWorkerUtil.IsPromise(dataToSendToWebWorker))
                            {
                                dataToSendToWebWorker.catch(ex => callback(null, ex))
                                                     .then(z => post(z));
                                return;
                            }

                            var msg = new WebWorkerUtil.StatefulActivityWriteRequest(id, dataToPost, true);
                            self.postMessage(Accelatrix_Serialization.Serialization.ToJSON(msg), null);

                            callback(null, null); // return immediatelly whith waiting for a response.
                       }

            post(dataToPost);                          
        }

        export function SetSync(id: string, data: any, dataTransform: (data: any) => any)
        {
            var entry = Get(id);
            var existingData = entry.Data == null
                               ? null
                               : entry.Data;

            if (existingData == null)
            {
                entry.Data = [];
                existingData = [];
            }                

            var dataToPush = dataTransform == null
                             ? data
                             : dataTransform(data);

            entry.Data = [ dataToPush ];

            return data;
        }

        function SetAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, data: any, dataTransform: (data: any) => any, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var isEnumerable = data != null && data.Any != null;

            if (isEnumerable) data = data.Freeze();

            var untransformedDataToPost = isEnumerable
                                          ? data.ToList()
                                          : data;

            var untransformedDataToPostIsPromise = WebWorkerUtil.IsPromise(untransformedDataToPost);

            var dataToPost = dataTransform == null
                             ? untransformedDataToPost
                             : !untransformedDataToPostIsPromise
                               ? dataTransform(untransformedDataToPost)
                               : Accelatrix_Async.Async.Chain(untransformedDataToPost as PromiseLike<any>,
                                                              z =>
                                                              { 
                                                                  untransformedDataToPost = z;
                                                                  return dataTransform(z)
                                                              });

            var post = (dataToSendToWebWorker?: any) =>
                       {
                            // commit enumerable or asynenumerable
                            if (dataToSendToWebWorker != null && dataToSendToWebWorker.Any)
                                dataToSendToWebWorker = dataToSendToWebWorker.ToList();

                            // wait on promises
                            if (WebWorkerUtil.IsPromise(dataToSendToWebWorker))
                            {
                                dataToSendToWebWorker.catch(ex => callback(null, ex))
                                                     .then(z => post(z));
                                return;
                            }

                            var msg = new WebWorkerUtil.StatefulActivityWriteRequest(id, dataToPost, false);
                            self.postMessage(Accelatrix_Serialization.Serialization.ToJSON(msg), null);

                            callback(null, null); // return immediatelly whith waiting for a response.
                       }

            post(dataToPost); 
        }
        
        export function ReadAndPushSync(id: string, data: any, dataTransform: (data: any) => any)
        {
            var entry = Get(id);
            var result = entry.Data;

            if (result == null)
                entry.Data = []

            var dataToPush = dataTransform == null
                             ? data
                             : dataTransform(data);

            entry.Data.push(dataToPush);

            return result;
        }

        function ReadAndPushAsync(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void }, id: string, data: any, dataTransform: (data: any) => any, callback: (newData: any, exception: Accelatrix_Base.Exception) => void)
        {
            var msgId = Date.now().toString() + self["__WebWorkerId__"];
            var isEnumerable = data != null && data.Any != null;

            if (isEnumerable) data = data.Freeze();

            var untransformedDataToPost = isEnumerable
                                          ? data.ToList()
                                          : data;

            var untransformedDataToPostIsPromise = WebWorkerUtil.IsPromise(untransformedDataToPost);

            var dataToPost = dataTransform == null
                             ? untransformedDataToPost
                             : !untransformedDataToPostIsPromise
                               ? dataTransform(untransformedDataToPost)
                               : Accelatrix_Async.Async.Chain(untransformedDataToPost,
                                                              z =>
                                                              { 
                                                                  untransformedDataToPost = z;
                                                                  return dataTransform(z)
                                                              });


            var onResult = (result: Function, ex: Accelatrix_Base.Exception) =>
                           {
                              if (ex != null)
                                callback(null, ex);
                              else
                                callback(result, null);
                           };

            var post = (dataToSendToWebWorker?: any) =>
                       {
                            // commit enumerable or asynenumerable
                            if (dataToSendToWebWorker != null && dataToSendToWebWorker.Any)
                                dataToSendToWebWorker = dataToSendToWebWorker.ToList();

                            // wait on promises
                            if (WebWorkerUtil.IsPromise(dataToSendToWebWorker))
                            {
                                dataToSendToWebWorker.catch(ex => onResult(null, ex))
                                                     .then(z => post(z));
                                return;
                            }

                            var msg = new WebWorkerUtil.StatefulActivityReadAndPushRequest(id, msgId, dataToPost);
                            
                            PostAndListen(canceller, msg, onResult);
                       }

            post(dataToPost);
        }       
    }
}
