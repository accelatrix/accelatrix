/// <reference path="./Base.ts" />
/// <reference path="./Enumerable.ts" />
/// <reference path="./Collections.ts" />

import { Accelatrix as Accelatrix_Base } from "./Base";
import { Accelatrix as Accelatrix_Number } from "./Number";
import { Accelatrix as Accelatrix_Serialization } from "./Serialization";
import { Accelatrix as Accelatrix_Enumerable } from "./Enumerable";
import { Accelatrix as Accelatrix_AsyncEnumerable } from "./AsyncEnumerable";
import { Accelatrix as Accelatrix_Async } from "./Async";
import { Accelatrix as Accelatrix_Tasks } from "./Tasks";
import { Accelatrix as Accelatrix_Collections } from "./Collections";
import { WebWorkerUtil } from "./Tasks-WebWorkers";


export namespace Accelatrix
{
    export namespace Collections
    {
        //------------ From ECMA Script 2015 ---------------
        interface IteratorResult<T>
        {
            done: boolean;
            value: T;
        }

        interface Iterator<T>
        {
            next(value?: any): IteratorResult<T>;
            return?(value?: any): IteratorResult<T>;
            throw?(e?: any): IteratorResult<T>;
        }

        interface IterableIterator<T> extends Iterator<T>
        {

        } 

        /** Operations for enumerations. */
        export interface IEnumerableOps<T>
        {
            /**
            * Creates a new enumeration that is handled in Web Workers. 
            * The Tasks.Config.Scripts static property must have been set once in the session to present the baseline JS scripts/code segments to be used by tasks. Ensure that the scripts or code pertaining to Base.js, Object.js, Linq.js and Tasks.js are always included.
            */
            AsParallel: () => Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<T>;
        }

        /** Operations for enumerations. */
        export interface IEnumerableAsyncOps<T>
        {
            /**
            * Creates a new enumeration that is handled in Web Workers. 
            * The Tasks.Config.Scripts static property must have been set once in the session to present the baseline JS scripts/code segments to be used by tasks. Ensure that the scripts or code pertaining to Base.js, Object.js, Linq.js and Tasks.js are always included.
            */
            AsParallel: () => Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<T>;
        } 

        //---------

        /** A cancellable promise issued by a ParallelQuery's GetAwaiter(). */
        export interface IParallelQueryPromise<T> extends Accelatrix_Async.Async.IChainablePromise<T>
        {
            /** Allows to subscribe to partial results. */
            OnPartialResult(onPartialResult: (result: T) => void) : IParallelQueryPromise<T>
        }

        namespace ParallelQuerySystem
        {              
            const MIN_MEMBERS_FOR_MULTIPLE_THREADS = 10000; //10000;            
            
            function AsParallel()
            {
                return new Accelatrix.Collections.ParallelQuery(this as any as Accelatrix_Enumerable.Collections.Enumerable<any>);
            }

            Object.defineProperty(AsParallel, "name", { get: () => "AsParallel" });
            
            Accelatrix_Enumerable.Collections.Enumerable.AddFunctionalMethod(AsParallel as any);  

            /** An enumeration that runs in parallel. */
            @Accelatrix_Serialization.Serialization.KnownType("Accelatrix.Collections.ParallelQuery")
            export class ParallelQuery<T> extends Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable<T> implements Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<T>
            {
                /**
                 * Creates a new Enumeration based on an existing enumeration.
                 * @param enumerable An array, an enumeration, or a factory
                 */
                public constructor(enumerable: Accelatrix_Enumerable.Collections.IEnumerableOps<T | PromiseLike<T>> | Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<T> | (() => IterableIterator<T | Promise<T>>))
                {        
                    super(enumerable as any);

                    if (enumerable["toJSON"] != null && enumerable.GetType() != this.GetType())
                        this.toJSON = enumerable["toJSON"];

                    var scalarDoer = (actionName: string | Function, actionArgs: Array<any>, onResultAction: (result: T | Array<T>, isPartial: boolean) => { Result: any, Handled: boolean }) =>
                    {
                        var resolver : (result: any) => void = null;
                        var rejector : (ex: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                        var finalizer : () => void = null; 
                        var execPromise : IParallelQueryPromise<Array<any>>; 
                        var returnResult = (result: boolean, ex: Accelatrix_Base.Exception) =>
                                        {
                                            try
                                            {
                                                if (ex != null)
                                                { 
                                                    if (rejector != null) rejector(ex);
                                                }
                                                else
                                                {
                                                    if (resolver != null) resolver(result);
                                                }
                                            }
                                            catch(e)
                                            {                                            
                                            }
                                            finally
                                            {
                                                execPromise = null;
                                                canceller.Cancel = () => {};

                                                if (finalizer != null)
                                                    finalizer();

                                                rejector = null;
                                                resolver = null;
                                                finalizer = null;                    
                                            }
                                        };

                        var canceller = { Cancel: (ex?: Accelatrix_Base.Exception) => returnResult(null, new Accelatrix_Tasks.Tasks.TaskAbortException()) };

                        var isDoing = false;

                        var myPromise = new ParallelQueryScalarPromise<boolean>(canceller,
                                                                                (newResolver) => { resolver = newResolver; doer(); },
                                                                                (newRejector) => rejector = newRejector,
                                                                                (newFinalizer) => finalizer = newFinalizer);

                        var myJSON = this.toJSON.bind(this);
                        Object.defineProperty(this, "toJSON", { value: () =>
                        {
                            let myresult = myJSON();
                            myresult.Members.push({ Op: actionName, Args: actionArgs});
                            return myresult;
                        }});

                        var doer = () =>
                        {
                            if (isDoing) return;

                            isDoing = true;

                            execPromise = this.GetAwaiter();
                            
                            execPromise.Catch(ex =>
                                            {
                                                returnResult(null, ex);
                                            });

                            execPromise.OnPartialResult(z =>
                            {
                                var actionResult = onResultAction(z, true);
                                if (actionResult.Handled)
                                    returnResult(actionResult.Result, null);
                            });

                            execPromise.Then(r =>
                            {
                                var actionResult = onResultAction(r, false);
                                returnResult(actionResult.Result, null);
                            });
                        }

                        return myPromise;
                    };

                    Object.defineProperty(this, "Any", { enumerable: false, value: () =>
                    {                
                        return scalarDoer("Any", null, (result, isPartial) =>
                                ({
                                        Handled: !isPartial
                                                ? true
                                                : result != null && (result as any) == true,
                                        Result: isPartial
                                                ? result == null ? null : (result as any) == true
                                                : (result as Array<any>).Where((z: any) => z == true).Any()
                                    }))
                    }});

                    Object.defineProperty(this, "NotAny", { enumerable: false, value: (element: T) =>
                    {                
                        return (this.Any() as any).ContinueWith(z => !z);
                    }});                    

                    Object.defineProperty(this, "Contains", { enumerable: false, value: (element: T) =>
                    {                
                        return scalarDoer("Contains", [ element ], (result, isPartial) =>
                                        ({
                                                Handled: !isPartial
                                                        ? true
                                                        : result != null && (result as any) == true,
                                                Result: isPartial
                                                        ? result == null ? null : (result as any) == true
                                                        : (result as Array<any>).Where(z => z == true).Any()
                                        }));
                    }});
                    
                    Object.defineProperty(this, "NotContains", { enumerable: false, value: (element: T) =>
                    {                
                        return (this.Contains(element) as any).ContinueWith(z => !z);
                    }});

                    Object.defineProperty(this, "FirstOrNull", { enumerable: false, value: () =>
                    {                
                        return scalarDoer("FirstOrNull", null, (result, isPartial) =>
                                        ({
                                                Handled: !isPartial
                                                        ? true
                                                        : result != null,
                                                Result: isPartial
                                                        ? result
                                                        : (result as Array<T>).Where(z => z != null).FirstOrNull()
                                        }));
                    }});

                    Object.defineProperty(this, "LastOrNull", { enumerable: false, value: () =>
                    {                
                        return scalarDoer("LastOrNull", null, (result, isPartial) =>
                                        ({
                                                Handled: !isPartial
                                                         ? false
                                                         : result != null,
                                                Result: isPartial
                                                        ? null
                                                        : (result as Array<T>).Where(z => z != null).LastOrNull()
                                        }));
                    }});

                    Object.defineProperty(this, "Count", { enumerable: false, value: () =>
                    {                
                        return scalarDoer("Count", null, (result, isPartial) =>
                                        ({
                                                Handled: !isPartial,
                                                Result: isPartial
                                                        ? null
                                                        : (result as any as Array<number>).Sum()
                                        }));
                    }});

                    Object.defineProperty(this, "Sum", { enumerable: false, value: (selector?: (element: T, index?: number) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>) =>
                    {                
                        return scalarDoer("Sum", selector == null ? null : [selector], (result, isPartial) =>
                                        ({
                                                Handled: !isPartial,
                                                Result: isPartial
                                                        ? null
                                                        : (result as Array<T>).Sum()
                                        }));
                    }});

                    Object.defineProperty(this, "Average", { enumerable: false, value: (selector?: (element: T, index?: number) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>) =>
                    {           
                        var doAverage = (entries: Array<{ Count: Number, Sum: any }>) =>
                        {
                            if (entries == null || !entries.Any()) return null;
                            
                            let isDate = entries.Take(1).Where(z => z.Sum != null && (z.Sum instanceof Date)).Any();
                            if (isDate)
                            {
                                var dates = (entries as Array<any>).Select(z => z.Sum as Date).Select(z => z.getTime()).ToList();
                                var min = dates.Min();
                                var dateSum = dates.Select(z => z - min).Sum();
                                let countDates = entries.Select(z => z.Count).Sum() as number;
                                return new Date(min + Math.round(dateSum / countDates));                                
                            }

                            let sum = entries.Select(z => z.Sum).Sum();
                            let count = entries.Select(z => z.Count).Sum() as number;
                            
                            if (sum["Amount"] != null)
                                sum["Amount"] = sum["Amount"] / count;
                            else
                                sum = sum as number / count;

                            return sum;
                        };
                    
                        return scalarDoer((z: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>, selector) => z.Select(w => selector == null ? w : selector(z))
                                                                                                                             .ToList()
                                                                                                                             .ContinueWith(w =>
                                                                                                                             {
                                                                                                                                let isDate = w.Take(1).Where(z => z != null && (z instanceof Date)).Any();
                                                                                                                                return isDate
                                                                                                                                       ? ({  Count: 1, Sum: w.Average() })
                                                                                                                                       : ({  Count: w.Count(), Sum: w.Sum() });
                                                                                                                             }),
                                                
                                           selector == null ? null : [ selector ],
                                           (result, isPartial) => ({
                                                                        Handled: !isPartial,
                                                                        Result: result == null
                                                                                ? null
                                                                                : doAverage(result as any as Array<{ Count: Number, Sum: Number }>)
                                                                  }));
                    }});

                    Object.defineProperty(this, "Min", { enumerable: false, value: (selector?: (element: T, index?: number) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>) =>
                    {                
                        return scalarDoer("Min", selector == null ? null : [ selector ], (result, isPartial) =>
                                        ({
                                                Handled: !isPartial,
                                                Result: isPartial
                                                        ? null
                                                        : (result as Array<T>).Min()
                                        }));
                    }});

                    Object.defineProperty(this, "Max", { enumerable: false, value: (selector?: (element: T, index?: number) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>) =>
                    {                
                        return scalarDoer("Max",
                                          selector == null ? null : [ selector ],
                                          (result, isPartial) =>  ({
                                                                        Handled: !isPartial,
                                                                        Result: isPartial
                                                                                ? null
                                                                                : (result as Array<T>).Max()
                                                                   }));
                    }});

                    Object.defineProperty(this, "ToDictionary", { enumerable: false, value: (keySelector, valueSelector) =>
                    {                
                        return scalarDoer("ToDictionary", [ keySelector, valueSelector ], (result, isPartial) =>
                                        ({
                                                Handled: !isPartial,
                                                Result: isPartial
                                                        ? null
                                                        : result == null
                                                        ? null
                                                        : (result as any as Accelatrix_Collections.Collections.HashMap<any, any>).GroupBy(z => z.Key)
                                                                                                                                 .ToDictionary(a => a.Key, b => b.Select(z => z.Value).SelectMany(z => z).SelectMany((z: any) => z).ToList())
                                        }));
                    }});

                    Object.defineProperty(this, "AsParallel", { enumerable: false, value: () => this });
                }

                /** Runs the parallel query and provides the outcome in the form of a cancellable promise. */
                public GetAwaiter(): IParallelQueryPromise<Array<T>>
                {
                    return Execute(this);
                }
                
                /**
                 * Iterates through each element in the enumeration and executes an action. The loop can be halted if the action returns false.
                 * @param action The action to execute. The cycle is halted if the action returns a boolean false.
                 */
                public ForEach(action: (element: T, index?: number) => boolean | void | any): void
                {
                    var awaiter = this.GetAwaiter();
                    var index = 0;
                    var endResult = undefined;

                    var canceller = () => { if (awaiter != null && awaiter.Cancel != null) awaiter.Cancel();  };
                    var finalizer: (exception?: Accelatrix_Base.Exception) => void;

                    var onResult_PartialOrComplete = (z: T[]) =>
                    {
                        var unpackedResult = z == null || z.Any == null
                                             ? [ z ]
                                             : z as Array<any>;

                        unpackedResult.ForEach(w =>
                        {
                            try
                            {
                                var result = action == null
                                             ? true
                                             : action(w, index++);
        
                                let proceed = result == null || !(result === false);

                                if (!proceed)
                                {
                                    awaiter.Cancel();
                                    return result;
                                }
                            }
                            catch(ex)
                            {
                                awaiter.Cancel();
                                throw ex;
                            }
                        });
                    }

                    // awaiter.OnPartialResult(onPartialResult); partial results are not accurate, e.g. Distinct

                    awaiter.catch(ex =>
                            {
                                canceller = null;
                                if (finalizer != null)
                                    finalizer(ex);

                                endResult = ex;
                            })
                            .then(z =>
                            {
                                onResult_PartialOrComplete(z);

                                canceller = null;
                                if (finalizer != null)
                                    finalizer();

                                endResult = null;
                            });

                    var result =  {
                                    Cancel: () =>
                                    {
                                        if (canceller != null)
                                            canceller();
                                    },

                                    Finally: (onFinished: (exception?: Accelatrix_Base.Exception) => void) =>
                                    {
                                        finalizer = onFinished;

                                        if (!(endResult === undefined))
                                        {
                                            if (endResult != null)
                                                onFinished(endResult);
                                            else
                                                onFinished(undefined);
                                        }

                                        return result;
                                    }
                                  };

                    return result as any;                    
                }
            }

            class ParallelQueryPromise<TIn, TOut extends Array<TOut>> implements IParallelQueryPromise<TOut>
            {    
                constructor(taskPromise: Accelatrix_Tasks.Tasks.ITaskPromise<TOut, TIn>, task: Accelatrix_Tasks.Tasks.CombinedTask<TIn, TOut>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, postParallelActivities: Array<(data: any) => any>, log?: Array<any>)
                {
                    var rejector: (ex: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                    var finalizer: () => void;

                    if (log != null)
                    {
                        log.push("Parallel");
                        log.push(Date.now());
                    }

                    taskPromise.Finally(t =>
                    {
                        if (statefulActivities != null)
                            statefulActivities.forEach(z => z.Dispose()); 
                        
                        if (log != null)
                        {
                            log.push("Done");
                            log.push(Date.now());                            
                            setTimeout(() => console.log(log), 1000);
                        }
                        
                        statefulActivities = null;
                        
                        if (finalizer != null)
                            finalizer();
                    });

                    Object.defineProperty(this, "Cancel", { enumerable: false, configurable: false, value: () =>
                    {
                        taskPromise.Cancel();

                        if (statefulActivities != null)
                            statefulActivities.forEach(z => z.Dispose()); 
                        
                        statefulActivities = null;
                    }});
        
                    Object.defineProperty(this, "then", { enumerable: false, configurable: false, value: (onfulfilled: (value: TOut) => void) =>
                    {
                        taskPromise.Then(result =>
                        {
                            if (onfulfilled == null) return;

                            var finalResult: any;

                            try
                            {
                                finalResult = result.SelectMany(z => z);

                                if (postParallelActivities != null)
                                    postParallelActivities.ForEach(z => finalResult = z(finalResult));

                                finalResult = finalResult.ToList();
                            }
                            catch(ex)
                            {
                                onfulfilled = null;
                                if (rejector != null)
                                    rejector(ex);
                            }

                            if (onfulfilled != null)
                                onfulfilled(finalResult as any);
                        });

                        return this;
                    }});
        
                    Object.defineProperty(this, "Then", { enumerable: false, configurable: false, value: (onfulfilled: (value: TOut) => void) =>
                    {
                        return this.then(onfulfilled);
                    }});
        
                    Object.defineProperty(this, "catch", { enumerable: false, configurable: false, value: (onrejected: (exception: Accelatrix_Base.Exception) => void) =>
                    {
                        rejector = onrejected;
                        taskPromise.Catch(ex =>
                        {
                            if (onrejected == null) return;

                            onrejected(ex);                 
                        });
                        return this;
                    }});
        
                    Object.defineProperty(this, "Catch", { enumerable: false, configurable: false, value: (onrejected: (exception: Accelatrix_Base.Exception) => void) =>
                    {
                        return this.catch(onrejected);
                    }});
        
                    Object.defineProperty(this, "Finally", { enumerable: false, configurable: false, value: (onFinished: () => void) =>
                    {
                        finalizer = onFinished;
                        return this;
                    }});
                    
                    Object.defineProperty(this, "OnPartialResult", { enumerable: false, configurable: false, value: (onPartialResult: (result: TOut) => void) =>
                    {
                        task.OnPartialResult(r =>
                        {
                            if (log != null)
                            {
                                log.push("Partial result");
                                log.push(Date.now());
                            }

                            if (onPartialResult == null) return;

                            onPartialResult(r);
                        });
                        return this;
                    }});

                    Object.defineProperty(this, "ContinueWith", { value: (continueWith: (result: TOut) => any, merge?: boolean) =>
                    { 
                        return Accelatrix_Async.Async.Chain(this, continueWith as any, merge);
                    }});
                }

                public OnPartialResult(onPartialResult: (result: TOut) => void)
                {
                    return this as any;
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
        
                public Finally(callback: () => void)
                {
                    return this as any;
                }

                public ContinueWith<TOut2>(continueWith: (result: TOut) => TOut2): Accelatrix_Async.Async.IChainablePromise<TOut2>
                public ContinueWith<TOut2>(continueWith: (result: TOut) => Accelatrix_Async.Async.ICancellablePromise<TOut2>, merge?: boolean): Accelatrix_Async.Async.IChainablePromise<TOut2>
                {
                    return this as any;
                }                
            }

            class ParallelQueryScalarPromise<T> implements Accelatrix_Async.Async.IChainablePromise<T>
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

                    Object.defineProperty(this, "ContinueWith", { value: (continueWith: (result: T) => any, merge?: boolean) =>
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

                public ContinueWith<TOut>(continueWith: (result: T) => TOut): Accelatrix_Async.Async.IChainablePromise<TOut>
                public ContinueWith<TOut>(continueWith: (result: T) => Accelatrix_Async.Async.ICancellablePromise<TOut>, merge?: boolean): Accelatrix_Async.Async.IChainablePromise<TOut>
                {
                    return this as any;
                }
            }    

            class ParallelQueryStreamPromise<T> extends ParallelQueryScalarPromise<T> implements IParallelQueryPromise<T>
            {    
                constructor(canceller: { Cancel: (ex?: Accelatrix_Base.Exception) => void}, changeResolver: (resolver: (result: T) => void) => void, changeRejector: (rejector: (exception: Error) => void) => void, changeFinallizer: (finalizer: () => void) => void, changeOnPartialResult: (omPartialResult: (result: T) => void) => void)
                {
                    super(canceller, changeResolver, changeRejector, changeFinallizer)
                    
                    Object.defineProperty(this, "OnPartialResult", { enumerable: false, configurable: false, value: (onPartialResult: (result: T) => void) =>
                    {
                        changeOnPartialResult(onPartialResult);
                        return this;
                    }});                
                }
                
                public OnPartialResult(onPartialResult: (result: T) => void)
                {
                    return this as any;
                }
            }        

            export function Execute<T>(parallelQuery: ParallelQuery<T>): IParallelQueryPromise<Array<T>>
            {
                var log = null;
                if (log != null)
                {
                    log.push("Start");
                    log.push(Date.now());
                }                
                
                var queryAnalysis = DescribeQuery(parallelQuery);
                var splitBetweenSyncAndParallel = SplitNonParallelFromParallel(queryAnalysis);
                splitBetweenSyncAndParallel = RestructureGroupBy(splitBetweenSyncAndParallel);

                if (!splitBetweenSyncAndParallel.Parallel.Any() && splitBetweenSyncAndParallel.CanNeverPartition)
                    return ExecuteSync(parallelQuery);

                if (!splitBetweenSyncAndParallel.CanPartition && splitBetweenSyncAndParallel.CanNeverPartition)
                    return ExecuteStream(splitBetweenSyncAndParallel.Sync, splitBetweenSyncAndParallel.Parallel, splitBetweenSyncAndParallel.PostParallelActivities);

                var minMembersInPartition = MinMembersInPartition(splitBetweenSyncAndParallel.Parallel);
                var partitions = Partition(queryAnalysis, splitBetweenSyncAndParallel.Sync, !splitBetweenSyncAndParallel.CanPartition, Accelatrix_Tasks.Tasks.Config.MaxParallelism, minMembersInPartition);

                if (!partitions.Any())
                    return ExecuteSync(parallelQuery);

                var parallelEnumeration = splitBetweenSyncAndParallel.Parallel;

                if (!parallelEnumeration.Any())
                    return ExecuteSync(parallelQuery);                

                // console.log(queryAnalysis);
                // console.log(splitBetweenSyncAndParallel);                        
                // console.log(partitions.ToList());

                var forceLastDistinctToRunInParallel = partitions.length > 1 && parallelEnumeration.LastOrNull()["Op"] == "Distinct";
                if (forceLastDistinctToRunInParallel)
                    parallelEnumeration.push({ Op: "Select", Args: [ z => z] });

                var activities = PackagedParallelActionSet.FromParallelMembers(parallelEnumeration, partitions.length > 1);

                var tasks = partitions.Select(inputEnumeration => new Accelatrix_Tasks.Tasks.Task(function (rootEnumeration: Accelatrix_Enumerable.Collections.IEnumerableOps<any>, actionRoster: PackagedParallelActionSet)
                                                                                                {
                                                                                                    return actionRoster.Execute(rootEnumeration) as any;
                                                                                                },
                                                                                                inputEnumeration,
                                                                                                activities))
                                      .ToList();                                  

                var combined = new Accelatrix_Tasks.Tasks.CombinedTask(tasks);

                var postParallelActivities = [ activities.PostParallelActivity ].Concat(splitBetweenSyncAndParallel.PostParallelActivities).Where(z => z != null).ToList();

                return new ParallelQueryPromise(combined.Start() as any, combined as any, activities.StatefulActivities, postParallelActivities, log) as any as IParallelQueryPromise<Array<T>>;
            }      

            /** When the enumeration cannot be partitioned into chunks to be executed in parallel, and therefore members are clubbed in a stream of chunks each chunck as a task. */
            function ExecuteStream(syncEnumerableMembers: Array<any>, parallelEnumerableMembers: Array<any>, postParallelActivities: Array<(data: any) => any>) : IParallelQueryPromise<Array<any>>
            {                        
                var source = StructureToEnumeration(syncEnumerableMembers).Freeze();
                var bufferLength = MinMembersInPartition(parallelEnumerableMembers);
                var ongoingTasks: Array<Accelatrix_Tasks.Tasks.Task<any, any>> = [];
                
                var resolver : (result: any) => void = null;
                var rejector : (ex: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                var finalizer : () => void = null;
                var onpartialResult : (result: any) => void = null;
                var canceller = { Cancel: (ex?: Accelatrix_Base.Exception) => {                                                                             
                                                                                try
                                                                                {
                                                                                    var myRejector = rejector;
                                                                                    rejector = null;

                                                                                    ongoingTasks.ForEach(z => z.Cancel());
                                                                                    source = [];
                                                                                                                                                                    
                                                                                    if (myRejector != null)
                                                                                        myRejector(new Accelatrix_Tasks.Tasks.TaskAbortException());
                                                                                }
                                                                                catch(ex)
                                                                                {
                                                                                }
                                                                                finally
                                                                                {
                                                                                    ongoingTasks.ForEach(z => z.Cancel());

                                                                                    if (finalizer != null)
                                                                                        finalizer();

                                                                                    rejector = null;
                                                                                    resolver = null;
                                                                                    finalizer = null;
                                                                                    onpartialResult = null;
                                                                                }
                                                                            } };
                var resolveImmediatelly = false;
                var results = [];

                var activities: PackagedParallelActionSet;
                var getActivities = (multipleTasks: boolean) => activities != null
                                                                ? activities
                                                                : PackagedParallelActionSet.FromParallelMembers(parallelEnumerableMembers, multipleTasks);

                var myPromise = new ParallelQueryStreamPromise<any>(canceller,
                                                                    (newResolver) => { resolver = newResolver; if (resolveImmediatelly) resolveResult() },
                                                                    (newRejector) => rejector = newRejector,
                                                                    (newFinalizer) => finalizer = newFinalizer,
                                                                    (newOnPartialResult) => onpartialResult = newOnPartialResult );            

                var resolveResult = () =>
                {                
                        try
                        {
                            var finalResult = results.SelectMany(z => z);

                            var postParallel = [ activities == null ? null : activities.PostParallelActivity ].Concat(postParallelActivities)
                                                                                                              .Where(z => z != null)
                                                                                                              .ToList();

                            postParallel.ForEach(z => finalResult = z(finalResult));

                            finalResult = finalResult.ToList();

                            if (resolver != null)
                            {
                                rejector = null;
                                resolver(finalResult);
                            }                            
                        }
                        catch(ex)
                        {
                            if (rejector != null)
                                rejector(ex);
                        }
                        finally
                        {
                            if (finalizer != null)
                                finalizer();

                            resolver = null;
                            rejector = null;
                            finalizer = null;
                            canceller.Cancel = () => { };
                            onpartialResult = null;

                            if (activities != null && activities.StatefulActivities != null)
                                activities.StatefulActivities.ForEach(z => z.Dispose());

                            activities = null;
                        }
                };

                var runTasks = () =>
                {
                    var availableThoughput = Accelatrix_Tasks.Tasks.Config.MaxParallelism == 0
                                             ? 1
                                             : Accelatrix_Tasks.Tasks.Config.MaxParallelism - ongoingTasks.length;

                    var tasks = Accelatrix_Enumerable.Collections.Enumerable.Range(0, availableThoughput)
                                                                            .Select(z => source.Take(bufferLength).ToList())
                                                                            .TakeWhile(z => z != null && z.Any())
                                                                            .Select(buffer => new Accelatrix_Tasks.Tasks.Task(function (rootEnumeration: Accelatrix_Enumerable.Collections.IEnumerableOps<any>, actionRoster: PackagedParallelActionSet)
                                                                                                                             {
                                                                                                                                    return actionRoster.Execute(rootEnumeration) as any;
                                                                                                                             },
                                                                                                                             buffer,
                                                                                                                             activities != null
                                                                                                                                ? activities
                                                                                                                                : getActivities(source.Any())))
                                                                            .ToList();

                    tasks.ForEach(z =>
                    {
                        ongoingTasks.push(z);

                        z.Start().Finally(t =>
                        {
                            ongoingTasks = ongoingTasks.Where(w => w != z).ToList();

                            if (t.Exception != null)
                            {
                                ongoingTasks.ForEach(w => w.Cancel());

                                try
                                {
                                    source = [];
                                    if (rejector != null)
                                        rejector(t.Exception);
                                }
                                catch(ex)
                                {

                                }
                                finally
                                {
                                    if (finalizer != null)
                                        finalizer();

                                    resolver = null;
                                    rejector = null;
                                    onpartialResult = null;
                                    canceller.Cancel = () => {};
                                }
                            }
                            else
                            {
                                results.push(t.Result);

                                try
                                {
                                    if (onpartialResult != null)
                                        onpartialResult(t.Result);
                                }
                                catch(ex)
                                {
                                    console.error(ex);
                                }

                                if (!source.Any() && ongoingTasks.length == 0) // done
                                    resolveResult();
                                else
                                    runTasks();
                            }
                        });
                    });
                };
                
                if (!source.Any())
                {
                    //setTimeout(() => resolveResult(), 0);
                    resolveImmediatelly = true;
                }                    
                else
                    runTasks();

                return myPromise;
            }

            // failsafe for queries that cannot be executed in a task
            function ExecuteSync(parallelQuery: ParallelQuery<any>) : IParallelQueryPromise<Array<any>>
            {
                var enumeration = StructureToEnumeration(parallelQuery.toJSON().Members.Where(z => z["Op"] != "AsParallel").ToList());
                var resolver : (result: any) => void = null;
                var rejector : (ex: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                var finalizer : () => void = null;
                var onpartialResult : (result: any) => void = null;
                var isDoing = false;

                var myPromise = new ParallelQueryStreamPromise<any>({Cancel: () => {}},
                                                                    (newResolver) => { resolver = newResolver; doer() },
                                                                    (newRejector) => rejector = newRejector,
                                                                    (newFinalizer) => finalizer = newFinalizer,
                                                                    (newOnPartialResult) => onpartialResult = newOnPartialResult );

                var doer = () =>
                {
                    if (isDoing) return;

                    isDoing = true;

                    try
                    {
                        var result = enumeration.ToList();

                        if (onpartialResult != null)
                            onpartialResult(result);

                        if (resolver != null)
                            resolver(result);
                    }
                    catch(ex)
                    {
                        if (rejector != null)
                            rejector(ex);
                    }
                    finally
                    {
                        if (finalizer != null)
                            finalizer();

                        rejector = null;
                        resolver = null;
                        finalizer = null;
                        onpartialResult = null;
                    }                    
                }

                return myPromise;
            }

            function DescribeQuery(parallelQuery: ParallelQuery<any>) : ParallelQueryDescriptor
            {
                var representation = parallelQuery.toJSON();

                var root = representation.Members;
                var start = root[0];
                var isArray = false;
                var range: { Start: number, Count: number } = null;
                var isGenerator = false;

                while (start != null)
                {
                    let startType = start.GetType();
                    
                    if (startType.IsArray)
                    {
                        isArray = true;
                        start = null;                    
                    }
                    else if (startType.IsFunction)
                    {
                        isGenerator = true;
                        start = null;
                    }                
                    else if (start["Op"] != null)
                    {
                        let opType= start["Op"].GetType();

                        if (opType.IsFunction && start["Op"]["name"] == "Enumerable_Range" && start["Args"] != null && start["Args"].length == 2)
                        {
                            range = ({ Start: start["Args"][0] , Count: start["Args"][1]});
                            root = start;
                            start = null
                        }
                        else
                        {
                            start = start["Op"];
                            root = start;
                        }                        
                    }
                    else if (startType.IsOfType(Accelatrix_Enumerable.Collections.Enumerable))
                    {
                        let newJSON = (start as Accelatrix_Enumerable.Collections.Enumerable<any>).toJSON();
                        root[0] = newJSON;
                        root = newJSON.Members;
                        start = root[0];
                    }                
                };

                const blackList = [ "Accelatrix.Collections.Enumerable", "Enumerable.Range", "Enumerable(", "Accelatrix.Collections.ParallelQuery", "ParallelQuery.Range", "ParallelQuery(", 
                                    "Accelatrix.Collections.AsyncEnumerable", "AsyncEnumerable.Range", "AsyncEnumerable(", "Accelatrix.Collections.AsyncEnumerable",
                                  ];

                let result = {
                                IsArray: isArray,
                                IsGenerator: isGenerator,
                                Range: range,
                                Host: root,
                                Structure: representation as IEnumerableDescriptor,
                                LinearActivitySequence: Object.FlattenHierarchy(representation,
                                                                                z => z["Members"] != null
                                                                                    ? z["Members"]
                                                                                    : z["Args"] != null
                                                                                        ? z["Args"]
                                                                                        : z["toJSON"] != null
                                                                                            ? z["toJSON"].Members
                                                                                            : z instanceof Function
                                                                                               ? z
                                                                                               : null)
                                                                .Skip(1)
                                                                .Select(z => z as LinearActivity)                                                
                                                                .ToList(),
                                    DataSources: []
                            }


                result = { 
                            ...result,
                            DataSources: result.LinearActivitySequence
                                               .Select((z, i) => ({ LinearActivitySequence: i, Activity: z, IsRootSource: z == root[0]}))
                                               .Where(z => z.Activity != root)
                                               .Where(z => z.Activity.GetType().IsArray
                                                                //|| z["Op"] == "Concat"
                                                                //|| z["Op"] == "GroupBy" 
                                                                //|| z["Op"] == "GroupByCpnsecutive" 
                                                                || (z.Activity.GetType().IsFunction && blackList.Where(w => z.Activity.toString().indexOf(w) >= 0).Any())
                                                )
                                                .ToList(),
                        };

                if (result.Range != null)
                    result.DataSources = [{ LinearActivitySequence: 0, Activity: result.Host["Op"], IsRootSource: true }].concat(result.DataSources);
            
                return result;
            }

            /**
             * Shift the actual location of .AsParallel() in the chain, based on the number and location of member-producing activities (Array, Gen function, Range, Concat, ...). A single non-gen-function member-producing data sources can be partitioned at source and the whole sequence parallelised, whereas [1,2,3].Concat[4,5,6].AsParallel().Select(z => z) will have the datasource iterated and then members parallelised. 
             * @param queryAnalysis The query analysis.
             * @returns Returns the descriptor for the part ran in the base thread, and the descriptor for the part run in parallel.
             */
            function SplitNonParallelFromParallel(queryAnalysis: ParallelQueryDescriptor)
            {
                var indexOfAsParallel = queryAnalysis.LinearActivitySequence.Select((z, i) => ({ Index: i, Activity: z})).Where(z => z.Activity["Op"] == "AsParallel").Select(z => z.Index).FirstOrNull();

                if (indexOfAsParallel == null) // query has been created directly via constructor, e.g. new Accelatrix.Collections.ParallelQuery([1, 2, 3]) or new Accelatrix.Collections.ParallelQuery([1, 2, 3].Concat([5, 6, 7]).Select(z => Accelatrix.Enumerable.Range(0, z)))
                {
                    var lastLinearActivityDataSource = queryAnalysis.DataSources.Select(z => z.LinearActivitySequence).LastOrNull();
                    var numberOfOpsInDataSources = queryAnalysis.LinearActivitySequence.Take(lastLinearActivityDataSource + 1).Where(z => z["Op"] != null).Count() + 1;

                    return {
                                Sync: queryAnalysis.Structure.Members.Take(numberOfOpsInDataSources).ToList(),
                                Parallel: queryAnalysis.Structure.Members.Skip(numberOfOpsInDataSources)
                                                                         .ToList(),  // to do: cleanse any nested .AsParallels in args
                                CanPartition: queryAnalysis.DataSources.length == 1 && (!(queryAnalysis.DataSources[0].Activity instanceof Function) || (queryAnalysis.Range != null && (queryAnalysis.DataSources[0].Activity.toString().indexOf("Enumerable.Range") >= 0) || queryAnalysis.DataSources[0].Activity.toString().indexOf("ParallelQuery.Range") >= 0)),
                                CanNeverPartition: queryAnalysis.DataSources
                                                                .Where(z => z.Activity instanceof Function && (queryAnalysis.Range == null || (z.Activity.toString().indexOf("Enumerable.Range") < 0 && z.Activity.toString().indexOf("AsyncEnumerable.Range") < 0 && z.Activity.toString().indexOf("ParallelQuery.Range") < 0)))
                                                                .Any(),

                                PostParallelActivities: [] as Array<(data: any) => any>
                            };
                }

                var numberOfDataSourcesBeforeAsParallel = queryAnalysis.DataSources.Where(z => z.LinearActivitySequence < indexOfAsParallel).ToList().length;

                return {
                            Sync: queryAnalysis.Structure.Members.TakeWhile(z => z.Op != "AsParallel").ToList(),
                            Parallel: queryAnalysis.Structure.Members.SkipWhile(z => z.Op != "AsParallel")
                                                                     .Where(z => z.Op != "AsParallel")
                                                                     .ToList(),  // to do: cleanse any nested .AsParallels in args
                            CanPartition: numberOfDataSourcesBeforeAsParallel <= 1 && (!queryAnalysis.IsGenerator || queryAnalysis.Range != null),
                            CanNeverPartition: queryAnalysis.DataSources
                                                            .Take(numberOfDataSourcesBeforeAsParallel)
                                                            .Where(z => z.Activity instanceof Function && (queryAnalysis.Range == null || (z.Activity.toString().indexOf("Enumerable.Range") < 0  && z.Activity.toString().indexOf("AsyncEnumerable.Range") < 0 && z.Activity.toString().indexOf("ParallelQuery.Range") < 0)))
                                                            .Any(),

                            PostParallelActivities: [] as Array<(data: any) => any>
                    };
            }

            function RestructureGroupBy(splitBetweenSyncAndParallel: { Sync: Array<any>, Parallel: Array<any>, CanPartition: boolean, CanNeverPartition: boolean, PostParallelActivities: Array<(data: any) => any> })
            {
                // will execute sync anyway
                if (!splitBetweenSyncAndParallel.Parallel.Any() && splitBetweenSyncAndParallel.CanNeverPartition)
                    return splitBetweenSyncAndParallel;

                const terminalOps = [ "Any", "FirsOrNull", "LastOrNull", "ToList" ];
                const dangerousStatements = [ "GroupBy", "GroupByConsecutive" ];

                var count = splitBetweenSyncAndParallel.Parallel.Where(z => dangerousStatements.Contains(z.Op)).Take(2).ToList().length;

                // no group by
                if (count == 0)
                    return splitBetweenSyncAndParallel;

                // GroupBy is last                
                if (count == 1 && dangerousStatements.Contains(splitBetweenSyncAndParallel.Parallel.Where(z => !terminalOps.Contains(z)).Select(z => z.Op).LastOrNull()))
                    return splitBetweenSyncAndParallel;

                // determine if the operation after GroupBy focuses on the group Key or on the members
                var extractFirstOperation = (inputFunc: Function) =>
                                            {
                                                var op = inputFunc.toString().split(".");
                                                if (op.length == 1) return "";
                                                var result = op[1];
                                                result = result.split("(")[0];
                                                result = result.split(" ")[0];
                                                return result.trim();
                                            };

                var opsAfterGroupBys = splitBetweenSyncAndParallel.Parallel.GroupByConsecutive(z => dangerousStatements.Contains(z.Op))
                                                                           .SkipWhile(z => z.Key != true)
                                                                           .Where(z => z.Key == false)
                                                                           .Select((z, i) => z.Select(w => w.Args == null || !w.Args.Any()
                                                                                                           ? null
                                                                                                           : w.Op != "Where" || extractFirstOperation(w.Args[0]) != "Key"
                                                                                                             ? { ...w, GroupIndex: i }
                                                                                                             : null)
                                                                                               .Where(z => z != null)
                                                                                               .Concat([({ Op: "Select", Args: [ function (x) { return x } ], GroupIndex: i})])
                                                                                               .FirstOrNull())
                                                                           .Where(z => z != null)
                                                                           .ToList();

                var notOkOperations = opsAfterGroupBys.Where(z => !(z.Op == "FirstOrNull")
                                                                  && !(z.Args.Any() && extractFirstOperation(z.Args[0]) == "Key"))
                                                      .FirstOrNull();

                if (notOkOperations == null)
                    return splitBetweenSyncAndParallel;

                // split
                var offendingIndex = splitBetweenSyncAndParallel.Parallel.Select((z, i) => ({ Index: i, Operation: z}))
                                                                         .Where(z => dangerousStatements.Contains(z.Operation.Op ))
                                                                         .Skip(notOkOperations.GroupIndex)
                                                                         .Select(z => z.Index)
                                                                         .FirstOrNull();

                splitBetweenSyncAndParallel.PostParallelActivities = splitBetweenSyncAndParallel.Parallel
                                                                                                .Skip(offendingIndex)
                                                                                                .Select(z => function(data) { return data[z.Op as string].apply(data, z.Args) })
                                                                                                .ToList();

                splitBetweenSyncAndParallel.Parallel = splitBetweenSyncAndParallel.Parallel.Take(offendingIndex).ToList();

                return splitBetweenSyncAndParallel;
            }

            function StructureToEnumeration(enumerationMembers: Array<any>) : Accelatrix_Enumerable.Collections.IEnumerableOps<any>
            {
                let obj = { $type:"Accelatrix.Collections.Enumerable", Members: enumerationMembers };

                var unboxEnumerable = (definition: IEnumerableDescriptor) =>
                {
                    let members = definition.Members as Array<any>;

                    let isEnumDefinition = members[0]["$type"] == "Accelatrix.Collections.Enumerable" || members[0]["$type"] == "Accelatrix.Collections.AsyncEnumerable" || members[0]["$type"] == "Accelatrix.Collections.ParallelQuery" ;
                    let isFunction = !isEnumDefinition && members[0]["Op"] instanceof Function;
                    let isArray = !isEnumDefinition && !isFunction;

                    let firstMember = isEnumDefinition
                                      ? unboxEnumerable(members[0])
                                      : isFunction
                                        ? members[0]["Op"].apply(null, members[0].Args)
                                        : members[0];
                                        
                    var result = isFunction
                                 ? firstMember
                                 : new Accelatrix_Enumerable.Collections.Enumerable(firstMember);

                    members.Skip(1)
                           .ForEach(z => result = result[z.Op].apply(result, z.Args));

                    return result;                                    
                }

                return unboxEnumerable(obj);
            }

            function Partition(parallelQueryDescriptor: ParallelQueryDescriptor, syncEnumerableMembers: Array<any>, needsCommit: boolean, numberOfPartitions: number, minMembersInPartition: number) : Array<Accelatrix_Enumerable.Collections.IEnumerableOps<any>>
            {
                if (!needsCommit)
                {
                    var myStructure =  {
                                            $type: "Accelatrix.Collections.Enumerable",
                                            Members: syncEnumerableMembers
                                       };

                    var myDescriptor = <ParallelQueryDescriptor>{
                                                                    IsArray: parallelQueryDescriptor.IsArray,
                                                                    IsGenerator: parallelQueryDescriptor.IsGenerator,
                                                                    Range: parallelQueryDescriptor.Range,
                                                                    Host: parallelQueryDescriptor.IsArray
                                                                          ? myStructure.Members
                                                                          : parallelQueryDescriptor.Host,
                                                                    Structure: myStructure
                                                                }

                    return DoPartition(myDescriptor, numberOfPartitions, minMembersInPartition);
                }

                var list = StructureToEnumeration(syncEnumerableMembers).ToList();

                var structure =  {
                                    $type: "Accelatrix.Collections.Enumerable",
                                    Members: [ list ]
                                 };

                var myDescriptor = <ParallelQueryDescriptor>{
                                                                IsArray: true,
                                                                IsGenerator: false,
                                                                Range: null,
                                                                Host: structure.Members,
                                                                Structure: structure
                                                            }

                return DoPartition(myDescriptor, numberOfPartitions, minMembersInPartition);
            }        

            function DoPartition(enumerationRoot: ParallelQueryDescriptor, numberOfPartitions: number, minMembersInPartition: number): Array<Accelatrix_Enumerable.Collections.IEnumerableOps<any>>
            {
                let nonParallelComponent = enumerationRoot.Structure.Members;

                /* Should never reach here and take the ExecuteStrean() method instead
                if (enumerationRoot.IsGenerator && enumerationRoot.Range == null)
                    return StructureToEnumeration(nonParallelComponent); // results in a Task per member
                */

                if (numberOfPartitions <= 1 || (enumerationRoot.IsGenerator && enumerationRoot.Range == null))
                    return [ StructureToEnumeration(nonParallelComponent) ] as any; // results in a single Task for all members

                let numberOfMembers = enumerationRoot.IsArray
                                      ? enumerationRoot.Host[0].length
                                      : enumerationRoot.Range.Count;

                let numberOfItemsPerPartition = Math.ceil(numberOfMembers / numberOfPartitions);
                
                if (numberOfItemsPerPartition < minMembersInPartition)
                {
                    numberOfItemsPerPartition = minMembersInPartition;
                    let actualNumberOfPartitions = Math.ceil(numberOfMembers / numberOfItemsPerPartition);

                    if (actualNumberOfPartitions > 1)
                        numberOfItemsPerPartition = Math.ceil(numberOfMembers / actualNumberOfPartitions);
                }                    

                let outstandingCount = numberOfMembers;
                let tranchNumber = -1;
                let sourceData = enumerationRoot.IsArray
                                 ? (enumerationRoot.Host as Array<any>)[0]
                                 : null;

                let result = [];

                while (outstandingCount > 0)
                {
                    outstandingCount -= numberOfItemsPerPartition;

                    let countInThisPartition = outstandingCount >= 0
                                            ? numberOfItemsPerPartition
                                            : numberOfItemsPerPartition + outstandingCount;

                    tranchNumber++;

                    if (enumerationRoot.IsArray)
                        enumerationRoot.Host[0] = (sourceData as []).Skip(tranchNumber * numberOfItemsPerPartition).Take(countInThisPartition).ToList();
                    else
                    {
                        enumerationRoot.Host.Args[0] = enumerationRoot.Range.Start + (tranchNumber * numberOfItemsPerPartition);
                        enumerationRoot.Host.Args[1] = countInThisPartition;
                    }                    

                    let myPartitionNonParallelComponent = enumerationRoot.Structure.Members;
                    let myNewEnum = StructureToEnumeration(myPartitionNonParallelComponent);

                    if (enumerationRoot.IsArray)
                        enumerationRoot.Host[0] = sourceData;
                    else
                    {
                        enumerationRoot.Host.Args[0] = enumerationRoot.Range.Start;
                        enumerationRoot.Host.Args[1] = enumerationRoot.Range.Count;
                    }

                    result.push(myNewEnum);
                }

                return result as any;
            }

            /** Look at the parallel part and weigh in on the expected complexity. More complex => less members to induce more threads */
            function MinMembersInPartition(parallelEnumerableMembers: Array<any>)
            {
                /*
                try
                {
                    var result = [];

                    var flatten = (root: any, depth: number) =>
                    {
                        if (root != null)
                        {
                            var me = root;
        
                            if (me instanceof Function)
                                me = drillIntoFunction(me as Function);
        
                            result.push({ 
                                            Depth: depth,
                                            Operation: me["Op"] != null
                                                    ? me["Op"]
                                                    : me 
                                        });
        
                            var children = me["Members"] != null
                                        ? me["Members"]
                                        : me["Args"] != null
                                            ? me["Args"]
                                            : me["toJSON"] != null
                                                ? me["toJSON"].Members
                                                : me instanceof Function
                                                ? drillIntoFunction(me as Function)
                                                : null;
        
                            if (children != null)
                                children.ForEach(z => flatten(z, depth + 1))
                        }
                    }
        
                    var drillIntoFunction = (f: Function) =>
                    {
                        var temp = f.toString()
                                    .split(".")
                                    .Skip(1)
                                    .Where(z => z.indexOf(")") > 0)
                                    .Select(z => z.substring(0, 1 + z.indexOf(")")))
                                    .Select(z => ({ 
                                                    Op: z.substring(0, z.indexOf("(")),
                                                    Args: z.substring(z.indexOf("(") + 1, z.length - 1).split(",")
                                                                                                        .map(w => w.indexOf("=>") > 0
                                                                                                                ? eval(w)
                                                                                                                : w.trim().indexOf("function") == 0
                                                                                                                    ? eval(w)
                                                                                                                    : w),
                                                }))
                                    .ToList();
        
                        return { Op: f, Members: temp };
                    };
        
                    parallelEnumerableMembers.forEach(z => flatten(z, 0));
        
                    // complexity weightage: more complex => more theads via less members on each
                    const scoreCard = {
                                        "Select": 1,
                                        "Where": 1,
                                        "map": 1,
                                        "filter": 1,
                                        "SelectMany": 1,
                                        "reduce": 1,
                                        "Distinct": 10,
                                        "Contains": 5,
                                        "GroupBy": 20,
                                        "Skip": -5, // as it needs cross thred operations
                                        "Take": -5, // as it needs cross thred operations
                                        "TakeWhile": 1,
                                        "SkipWhile": 1,
                                        "TakeWhileDistinct": 2.5,
                                        "SkipWhileDistinct": 2.5,
                                        "OfType": 2,
                                        "ToList": 2,
                                        "Count": 2,
                                        "Concat": -5, // as it needs cross-thread operations
                                        "Any": 1,
                                        "FirstOrNull": 1,
                                        "LastOrNull": 2,
                                        "Reverse": 2,
                                        "NotNullOrEmpty": 1,
                                        "OrderBy": 3,
                                        "OrderByDescending": 3,
                                        "Intersect": -10, // as it needs cross thred operations
                                        "Except": -10, // as it needs cross thred operations
                                        "Union": -5, // as it needs cross thred operations
                                        "Zip": -10, // as it needs cross thred operations
                                        "Interleave": -10, // as it needs cross thred operations
                                        "Sum": -2, // as it needs cross thred operations
                                        "Average": -2, // as it needs cross thred operations
                                        "Min": -2, // as it needs cross thred operations
                                        "Max": -2, // as it needs cross thred operations
                                    }
        
                    var scoring = result.Select(z => ({ 
                                                        Depth: z.Depth,
                                                        Weight: scoreCard[z.Operation.toString()] != null
                                                                ? scoreCard[z.Operation.toString()]
                                                                : 1
                                                    }))
                                        .Select(z => (z.Weight < 0 ? -1 : 1) * Math.abs(Math.pow(z.Weight, z.Depth)))
                                        .Sum();
        
                    //  . . . . . over engineered
                }
                catch(ex)
                {
                    return 100;
                }            
            
                */

                 // benefits of calculating this dynamically are outweighed by the introspection cost and always have a minimun of MIN_MEMBERS_FOR_MULTIPLE_THREADS members in Web Worker
                return parallelEnumerableMembers.Where(z => z != null && (z["Op"] == "Distinct" || z["Op"] == "Union")).Any()
                       ? Math.ceil(MIN_MEMBERS_FOR_MULTIPLE_THREADS / 4)
                       : parallelEnumerableMembers.Where(z => z != null && (z["Op"] == "Except" || z["Op"] == "Intersect")).Any()
                         ? Math.ceil(MIN_MEMBERS_FOR_MULTIPLE_THREADS / 3)
                         : MIN_MEMBERS_FOR_MULTIPLE_THREADS;
            }

            enum PackagedParallelActivityType
            {
                ParallelActivity,
                LastParallelActivity,
                LastParallelActivityPostParallel,
            }

            @Accelatrix_Serialization.Serialization.KnownType("Accelatrix.Collections.ParallelQuery.PackagedParallelActionSet")
            class PackagedParallelActionSet
            {
                constructor(activities:  Array<{ Op: string | Function, Args: Array<any>}>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, postParallelActivity: { Op: string | Function, Args: Array<any>} )
                {
                    Object.defineProperty(this, "CanClone", { enumerable: true, get: () => () => false });                    
                    Object.defineProperty(this, "StatefulActivities", { enumerable: false, get: () => statefulActivities });
                    Object.defineProperty(this, "PostParallelActivity", { enumerable: false, get: () => postParallelActivity });
                    Object.defineProperty(this, "Activities", { enumerable: true, get: () => activities });                    
                }

                public get StatefulActivities() : Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>
                {
                    return null;
                }

                public get Activities() : Array<{ Op: string | Function, Args: Array<any>}>
                {
                    return null;
                }

                public get PostParallelActivity() : (data: any) => Accelatrix_Enumerable.Collections.IEnumerableOps<any>
                {
                    return null;
                }            

                public static FromParallelMembers(parallelEnumerableMembers: Array<{ Op: string, Args: Array<any>}>, isQueryPartitioned: boolean)
                {
                    if (!isQueryPartitioned)
                        return new PackagedParallelActionSet(parallelEnumerableMembers, null, null);

                    var finalActivity = !parallelEnumerableMembers.Any() || PackagedParallelActionSet[parallelEnumerableMembers[parallelEnumerableMembers.length - 1].Op] == null
                                        ? null
                                        : PackagedParallelActionSet[parallelEnumerableMembers[parallelEnumerableMembers.length - 1].Op](parallelEnumerableMembers[parallelEnumerableMembers.length - 1].Args, statefulActivities, PackagedParallelActivityType.LastParallelActivityPostParallel);

                    finalActivity = finalActivity == null
                                    ? null
                                    : PackagedParallelActionSet.UnpackActivities(finalActivity).FirstOrNull();

                    var statefulActivities = [];
                    var activities = parallelEnumerableMembers.Select((z, i) => PackagedParallelActionSet[z.Op] == null
                                                                                ? [z]
                                                                                : PackagedParallelActionSet[z.Op](z.Args,
                                                                                                                  statefulActivities,
                                                                                                                  i + 1 == parallelEnumerableMembers.length
                                                                                                                    ? PackagedParallelActivityType.LastParallelActivity
                                                                                                                    : PackagedParallelActivityType.ParallelActivity) as Array<{ Op: string, Args: Array<any>}> )
                                                              .SelectMany(z => z)
                                                              .ToList();                                                          

                    return new PackagedParallelActionSet(activities, statefulActivities, finalActivity);
                }
                
                public Execute(rootEnumeration: Accelatrix_Enumerable.Collections.IEnumerableOps<any>) : Accelatrix_Async.Async.IChainablePromise<any>
                {
                    var resolver : (result: any) => void = null;
                    var rejector : (ex: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                    var finalizer : () => void = null;
                    var canceller = { Cancel: () => { } };
                    var isDoing = false;

                    var doer = () =>
                               {
                                    if (isDoing) return;
            
                                    isDoing = true;        

                                    WebWorkerUtil.WorkOnSequenceOfActivities(activities,  [ rootEnumeration ], (result, ex) =>
                                    {
                                        resolveResult(result, ex);
                                    });                        
                                }                    
        
                    var resolveResult = (result: any, exception: Accelatrix_Base.Exception) =>
                    {
                            try
                            {
                                if (exception != null)
                                {
                                    if (rejector != null)
                                        rejector(exception);
                                }
                                else
                                {
                                    if (resolver != null)
                                        resolver(result);
                                }
                            }
                            catch(ex)
                            {

                            }
                            finally
                            {
                                if (finalizer != null)
                                    finalizer();

                                resolver = null;
                                rejector = null;
                                finalizer = null;
                                canceller.Cancel = () => { };
                            }
                    };

                    var myPromise = new ParallelQueryScalarPromise<any>(canceller,
                                                                        (newResolver) => { resolver = newResolver; doer(); },
                                                                        (newRejector) => rejector = newRejector,
                                                                        (newFinalizer) => finalizer = newFinalizer);

                    var activities = [ (data: Accelatrix_Enumerable.Collections.IEnumerableOps<any>) => data == null ? data : new Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable(data) ] // IMPORTANT!! make data AsyncEnumerable so that buffered parallel activities can be upacked, e.g. Distinct()
                                         .Concat(this.UnpackActivities())
                                         .Concat([ (data: Accelatrix_Enumerable.Collections.IEnumerableOps<any>) => data == null || data.ToList == null? data : data.ToList() ]) // IMPORTANT!! force results to commit on exit of the thread
                                         .Concat([ data => data == null || data.ToList == null? data : PackagedParallelActionSet.ResolveAsyncEnumerations(data) ]) // IMPORTANT!! force groups to commit on exit of the thread
                                         .ToList();

                    canceller.Cancel = () =>
                    {                    
                        resolveResult(null, new Accelatrix_Tasks.Tasks.TaskAbortException());
                        var x = activities.LastOrNull(); // force going to the last member
                    };
                    
                    return myPromise;
                }

                private static ResolveAsyncEnumerations(collection: Array<any>)
                {
                    if (collection == null || collection.ToList == null) return collection;

                    var promises = collection.Select(z =>
                                              ({
                                                  Element: z,
                                                  IsPromise: Accelatrix_Async.Async.IsPromise(z),
                                                  IsEnumerable: z != null && z.constructor["name"] == "Enumerable",
                                                  IsAsyncEnumerable: z != null && z.constructor["name"] == "AsyncEnumerable"
                                              }))
                                              .Select(z =>
                                              ({
                                                  Element: z.IsPromise
                                                           ? z.Element
                                                           : z.IsAsyncEnumerable
                                                             ? z.Element.ToList()
                                                             : z.IsEnumerable
                                                               ? z.Element.ToList()
                                                               : z.Element,
                                                 
                                                  IsPromise: z.IsPromise || z.IsAsyncEnumerable
                                              }))
                                              .ToList();

                    if (!promises.Where(z => z.IsPromise).Any())
                        return promises.Select(z => z.Element).Where(w => !(w === undefined)).ToList();

                    var myPromise = Accelatrix_Async.Async.CombineAll(promises.Where(z => z.IsPromise).Select(z => z.Element).ToList())
                                                          .ContinueWith(z =>
                                                          {
                                                              var pendingResult = promises.Where(z => z.IsPromise).ToList();
                                                              z.ForEach((w, i) => pendingResult[i].Element = w);

                                                              var result = promises.Select(w => w.Element).Where(w => !(w === undefined)).ToList();

                                                              return PackagedParallelActionSet.ResolveAsyncEnumerations(result);

                                                          }, true);

                    return myPromise;
                }

                private static UnpackActivities(activities: Array<{ Op: string | Function, Args: Array<any>}>)
                {                    
                    return activities == null
                           ? []
                           : activities.Select(z => (z.Op as any) instanceof Function
                                                    ? function(data: Accelatrix_Enumerable.Collections.IEnumerableOps<any>) { return (z.Op as any as Function).apply(data, [data].concat(z.Args) ) as Accelatrix_Enumerable.Collections.IEnumerableOps<any> }
                                                    : function(data: Accelatrix_Enumerable.Collections.IEnumerableOps<any>) { return data[z.Op as string].apply(data, z.Args) as Accelatrix_Enumerable.Collections.IEnumerableOps<any> })
                                       .ToList();
                }

                private UnpackActivities()
                {
                    return PackagedParallelActionSet.UnpackActivities(this.Activities);
                }

                private static Concat(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z ] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Concat", Args: args }]; // concat at the end of the consolidated result

                    // need to share state between concurent threads so that only one will be concated
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var what = statefulActivity.PushAndEvaluate(() => 1,
                                                                (existing, current) => existing.length > 0
                                                                                       ? (z: Array<any>) => z.FirstOrNull()
                                                                                       : (z: Array<any>) => z.SelectMany(w => w))
                    return  [ 
                                { Op: (data, concatData) => [data, concatData], Args: args } ,
                                { Op: what, Args: args } 
                            ];
                }

                private static Take(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Take", Args: args }]; // Take

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Take", Args: args }]; // ReTake

                    // need to share state between concurent threads so that only a total is taken
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'return data[0].Concat(data[1]).Take(" + args[0] + " - ' + existing.Sum() + ')')");


                    var what = statefulActivity.PushAndEvaluate((data: [[], any] ) => data[0].length,
                                                                evaluator as any);
                    return  [ 
                                { 
                                    Op: (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>, takeCount: number) =>
                                        {
                                            var chunkPromise = data.Freeze().Take(takeCount).ToList();
                                            return chunkPromise.ContinueWith(r => r === undefined
                                                                                  ? r
                                                                                  : [ r, data ]);
                                        },
                                    Args: args
                                },
                                { Op: what, Args: args } 
                            ];
                }

                private static Skip(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return null;

                    // need to share state between concurent threads so that only a total is taken
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'return data[0].Concat(data[1]).Skip(" + args[0] + " - ' + existing.Sum() + ')')");

                    var what = statefulActivity.PushAndEvaluate((data: [[], any] ) => data[0].length,
                                                                evaluator as any);
                    return  [ 
                                { 
                                    Op: (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>, skipCount: number) =>
                                        {
                                            var chunkPromise = data.Freeze().Take(skipCount).ToList();
                                            return chunkPromise.ContinueWith(r => r === undefined
                                                                                  ? r
                                                                                  : [ r, data ]);
                                        },
                                  Args: args
                                } ,
                                { Op: what, Args: args } 
                            ];
                }

                private static Distinct(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Distinct", Args: args }]; // do it between the elements in the thread

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Distinct", Args: args }]; // do it again for the merged results

                    // need to share state between concurent threads based on HashCodes
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'var hashes=[' + existing.SelectMany(function(z) { return z }).Distinct().Intersect(current).Distinct().ToList().join(',')  + ']; data.Take(1).ForEach(function(z) { return hashes.ForEach(w => z.RejectedHashes.push(w)) }); return data.Where(function(z) { return hashes.NotContains(z == null ? null : z.ElementHash) } ).Select(function(z) { return z.Element } )')");

                    var what = statefulActivity.StreamPushAndEvaluate((data: Array<any>) => data.Select(z => z.ElementHash),
                                                                       evaluator as any);

                    return  [
                                { Op: (data, equalityComparer) => { 
                                                                     var rejectedHashes = [];

                                                                     return data.Distinct(equalityComparer)
                                                                                .Select(z => ({ 
                                                                                                 Element: z,
                                                                                                 ElementHash: z == null ? null : z.GetHashCode(),
                                                                                                 RejectedHashes: rejectedHashes
                                                                                             }))
                                                                                .Where(z => z.RejectedHashes.NotContains(z.ElementHash))
                                                                  }, Args: args },
                                { Op: what, Args: args }
                            ];
                }

                private static TakeWhileDistinct(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "TakeWhileDistinct", Args: args }]; // do it between the elements in the thread

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Distinct", Args: args }]; // do it again for the merged results

                    var distinctActivities = PackagedParallelActionSet.Distinct(args, statefulActivities, activityType);

                    return [ { Op: "TakeWhileDistinct", Args: args }].Concat(distinctActivities as any);
                }

                private static Union(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Union", Args: args }]; // do it after

                    // need to share state between concurent threads based on HashCodes
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    type SharedElement = { Element: any, ElementHash: number, IsFirst: boolean, IsClaimedByFirst: boolean, UnionClaimed: false };

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'var unionClaimed = ' + existing.Any() + ';var areTaken=' + JSON.stringify(existing.Concat(current).SelectMany(function(z) { return z }).Where(function(z) { return z.IsFirst }).Select(function(z) { return z.ElementHash }).Intersect(current.Select(function(z) { return z.ElementHash })).Distinct().ToList()) + ';return data.Select(function(z) { return ({ Element: z.Element, ElementHash: z.ElementHash, IsFirst: z.IsFirst, IsClaimedByFirst: z.IsClaimedByFirst != null ? z.IsClaimedByFirst : z.IsFirst || areTaken.Contains(z.ElementHash), UnionClaimed: unionClaimed }) }).ToList();')");

                    var streamPushAndEvaluate = statefulActivity.StreamPushAndEvaluate((data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<SharedElement>) => data.Where(z => z.IsClaimedByFirst == null) // do not push down for the elements we already know
                                                                                                                                                                                .GroupBy(z => z.ElementHash)
                                                                                                                                                                                .Select(z => ({ ElementHash: z.Key, IsFirst: z.Where(w => w.IsFirst).Any() })),
                                                                                        evaluator as any);

                    return  [ 
                                {
                                     Op: (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>, sequence: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>, statefulActivity: Accelatrix_Tasks.Tasks.StatefulActivity<SharedElement>) =>
                                         {
                                             var unionClaimed = null;
                                             
                                             // Elements that have already been confirmed with competing threads
                                             var establishedElementOwnership: Accelatrix_Enumerable.Collections.IEnumerableOps<SharedElement> = null;

                                             // data factory
                                             var myData = data.Select(z => ({ Element: z, IsFirst: true, T: self["__WebWorkerId__"] }))
                                                              .Concat(sequence.Select(z => ({ Element: z, IsFirst: false, T: self["__WebWorkerId__"] })))
                                                              .Select((z, i) =>
                                                                      {
                                                                         //console.log(i, "Source", z.Element, "T", self["__WebWorkerId__"]);
                                                                         let elementHash = z.Element == null ? null : z.Element.GetHashCode();
                                                                         return { 
                                                                                    Element: z.Element,
                                                                                    ElementHash: elementHash,
                                                                                    IsFirst: z.IsFirst,
                                                                                    IsClaimedByFirst: establishedElementOwnership == null
                                                                                                      ? null
                                                                                                      : unionClaimed === true
                                                                                                        ? true
                                                                                                        : establishedElementOwnership.Where(w => elementHash == w.ElementHash && w.IsClaimedByFirst != null).Select(w => w.IsClaimedByFirst).FirstOrNull()
                                                                                } as SharedElement;
                                                                      });

                                             // produce a continuous stream of the element hashes produced by me, which have been claimed by myself or by a competing thread
                                             var elementOwneshipPromise = statefulActivity(myData) as Accelatrix_Async.Async.IChainablePromise<Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<SharedElement>>;

                                             return elementOwneshipPromise.ContinueWith(elementOwnership =>
                                             {                 
                                                // those from the enumeration of elementOwnership that are no longer promises
                                                establishedElementOwnership = new Accelatrix_Enumerable.Collections.Enumerable(elementOwnership as any).TakeWhile(w => !Accelatrix_Async.Async.IsPromise(w)) as any;

                                                return new Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable(elementOwnership)
                                                                       .Select((z, i) =>
                                                                        { 
                                                                            if (i == 0)
                                                                                unionClaimed = z.UnionClaimed;

                                                                            return z;
                                                                        })
                                                                       .Where(z => {  return z.IsFirst || (!z.IsClaimedByFirst && unionClaimed === false)})
                                                                       .Select(z => z.Element);
                                             });
                                         },

                                         Args: [ args[0], streamPushAndEvaluate ]
                                } ,
                            ];                            
                }               
                
                private static GroupBy(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    // This implementation does not cater for members across threads. The ParallelQuery engine will ensure that .GroupBy with references to members is not parallelised

                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "GroupBy", Args: args }]; // do it after

                    // need to share state between concurent threads based on HashCodes
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    type GroupElement = { Key: any, Element: any, KeyHash: number, IsMine?: boolean };

                    // --------------------------------- Wire StatefulActivity for Groups -------------------------------------------------------------------------------

                    // What gets pushed down to the base thread
                    var transformToPost = function (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<GroupElement>)
                                          {
                                            return data.Where(z => z.IsMine == null) // do not push down for the groups we already know
                                                       .Select(z => z.KeyHash)
                                                       .Distinct() // just the distinct groups
                                                       .Select(z => ({ G: z, T: self["__WebWorkerId__"] as number })); // Group Hash + Thread Id
                                          };

                    // What gets evaluated in the base thread based on what the thead posted
                    var innerEvaluator = function(existing: { G: number, T: number, Members?: [] }[][], current: { G: number, T: number }[])
                                         {
                                             // the Group hashes that the thread requested to deem its own, but have been already taken by a competing thread
                                             var areTaken = existing.SelectMany(z => z)
                                                                    .Where(z => z.Members == null)
                                                                    .Where(z => current.Select(w => w.G)
                                                                                       .Contains(z.G))
                                                                    .GroupBy(z => z.G)
                                                                    .Where(z => z.FirstOrNull().T != current.FirstOrNull().T)
                                                                    .Select(z => z.Key)
                                                                    .ToList();

                                             // What gets applied to the data in the thread as the result og the inner evaluator in the base thread                                                                    
                                             var resultingEvaluator = function(data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<GroupElement>)
                                                                      {
                                                                            // the Group hashes that I need to let go of injected by the innerEvaluator
                                                                            var areTaken = '{0}' as any as Array<number>;

                                                                            return data.Select(z =>
                                                                                        ({ 
                                                                                            Key: z.Key,
                                                                                            Element: z.Element,
                                                                                            KeyHash: z.KeyHash,
                                                                                            IsMine: areTaken.NotContains(z.KeyHash)
                                                                                        }))
                                                                                        .ToList();
                                                                       }

                                             var intermediate = new Function("return " + resultingEvaluator.toString().replace("'{0}'", JSON.stringify(areTaken)));

                                             return intermediate() as (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<GroupElement>) => Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<GroupElement>;
                                         }

                    var streamPushAndEvaluateGroups = statefulActivity.StreamPushAndEvaluate(transformToPost, innerEvaluator as any);

                    return  [ 
                                {
                                     Op: (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>, clause: (element: any) => any, groupStreamer: (data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<GroupElement>) => Accelatrix_Async.Async.IChainablePromise<Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<GroupElement>>) =>
                                         {
                                             // Groups that have already been confirmed with competing threads
                                             var establishedGroupOwnership: Accelatrix_Enumerable.Collections.IEnumerableOps<GroupElement> = null;

                                             // data factory
                                             var myData = data.Select(z =>
                                                                      {
                                                                         let key = clause(z);
                                                                         let keyHash = key == null ? null : key.GetHashCode();
                                                                         return { 
                                                                                    Key: key,
                                                                                    Element: z,
                                                                                    KeyHash: keyHash,
                                                                                    IsMine: establishedGroupOwnership == null
                                                                                            ? null
                                                                                            : establishedGroupOwnership.Where(w => keyHash == w.KeyHash).Select(w => w.IsMine).FirstOrNull()
                                                                                } as GroupElement;
                                                                      });

                                             // produce a continuous stream of the group hashes produced by me, which have been claimed by myself or by a competing thread
                                             var groupOwneshipPromise = groupStreamer(myData);

                                             return groupOwneshipPromise.ContinueWith(groupOwnership =>
                                             {
                                                // those from the enumeration of groupOwnership that are no longer promises
                                                establishedGroupOwnership = new Accelatrix_Enumerable.Collections.Enumerable(groupOwnership as any).TakeWhile(w => !Accelatrix_Async.Async.IsPromise(w)) as any;

                                                return new Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable(groupOwnership)
                                                                     .Where(z => z.IsMine)
                                                                     .GroupBy(z => z.Key)
                                                                     .Select(z =>
                                                                     {
                                                                          var key = z.Key;
                                                                          var membersInThisThead = new Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable(z.Select(w => w.Element));
                                                                          var membersEnum = membersInThisThead; //.Concat(statefulActivity.SubscribeStream(new Function("data", "data.Where(function(z) { return z.KeyHash == " + z.Key + "})")  as any));  // members in other threads
                                                                          Object.defineProperty(membersEnum, "Key", { enumerable: true, get:() => key });
                                                                          return membersEnum;
                                                                     });
                                             });
                                         },

                                         Args: [ args[0], streamPushAndEvaluateGroups ]
                                } ,
                            ];                            
                }                  

                private static Except(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Except", Args: args }]; // do it after

                    return [ { Op: "Except", Args: args }]; // simple Except  
                }

                private static Intersect(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Intersect", Args: args }]; // do it after

                    /*
                    // need to share state between concurent threads based on HashCodes
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'var hashes=[' + existing.SelectMany(z => z).Distinct().ToList().join(',')  + ']; return data.Select(z => z.Data.Where(function(w) { return !Accelatrix.Async.IsPromise(w) ? data.Select(x => x.Element).Contains(w) || hashes.Contains(w == null ? null : w.GetHashCode()) : Accelatrix.Chain(w, r => data.Select(x => x.Element).Contains(r) || hashes.Contains(r == null ? null : r.GetHashCode()))  })).FirstOrNull()')");

                    var what = statefulActivity.StreamPushAndEvaluate((data: Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<any>) => data.Take(1).Select(z => z.Popped.Select(w => w == null ? null : w.GetHashCode())).FirstOrNull(),
                                                                       evaluator as any);                            

                    return  [ 
                                { Op: (data, sequence) => {
                                                                var popped = [];
                                                                var poppeedAsync = new Accelatrix_AsyncEnumerable.Collections.AsyncEnumerable(popped);
                                                                var storePoppedElement = elem =>
                                                                {
                                                                        if (!Accelatrix_Async.Async.IsPromise(elem))
                                                                        {
                                                                            popped.push(elem);
                                                                            //return elem;
                                                                            return { Element: elem, Popped: poppeedAsync, Data: data }
                                                                        }
                                                                        else
                                                                        {
                                                                           var result = { Element: elem, Popped: poppeedAsync, Data: data };
                                                                           var position = popped.length - 1;
                                                                           var wrapped = Accelatrix_Async.Async.Chain(elem, r =>
                                                                                                                            {
                                                                                                                                popped[position] = r;
                                                                                                                                result.Element = r;
                                                                                                                                return r;
                                                                                                                            });
                                                                           popped.push(wrapped);
                                                                           result.Element = wrapped;
                                                                           //return wrapped;
                                                                           return result;
                                                                        }
                                                                };

                                                                return sequence.Select(z => storePoppedElement(z));

                                                          }, Args: args } ,
                                { Op: what, Args: args }
                            ];
                            */

                    return [ { Op: "Intersect", Args: args }]; // simple intersect                           
                }

                private static Interleave(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Interleave", Args: args }]; // do it after

                    // need to share state between concurent threads based on HashCodes
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'var totalTaken=' + existing.SelectMany(function(z) { return z}).Sum() + '; var myTake=' + current + ';return new Accelatrix.Collections.AsyncEnumerable(data.Select(function(z) { return z.Me})).Interleave(data.FirstOrNull().Sequence.Skip(totalTaken).Take(myTake))')");

                    var what = statefulActivity.StreamPushAndEvaluate((data: Array<{ Me: any, Sequence: [] }> ) => data.length,
                                                                       evaluator as any);
                    return  [ 
                                { Op: (input, sequence) => input.Select(z => ({ Me: z, Sequence: sequence })), Args: args },
                                { Op: what, Args: args } 
                            ];                           
                }

                private static Zip(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivity)
                        return [ { Op: "Select", Args: [ z => z] }]; // do nothing

                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return [ { Op: "Zip", Args: args }]; // do it after

                    // need to share state between concurent threads based on HashCodes
                    var statefulActivity = new Accelatrix_Tasks.Tasks.StatefulActivity();
                    statefulActivities.push(statefulActivity);

                    var evaluator = new Function("existing", "current",
                                                 "return new Function('data', 'var totalTaken=' + existing.SelectMany(function(z) { return z}).Sum() + '; var myTake=' + current + ';return new Accelatrix.Collections.AsyncEnumerable(data.Select(function(z) { return z.Me})).Zip(data.FirstOrNull().Sequence.Skip(totalTaken).Take(myTake))')");

                    var what = statefulActivity.StreamPushAndEvaluate((data: Array<{ Me: any, Sequence: [] }> ) => data.length,
                                                                      evaluator as any);
                    return  [ 
                                { Op: (input, sequence) => input.Select(z => ({ Me: z, Sequence: sequence })), Args: args },
                                { Op: what, Args: args } 
                            ];                           
                }                 

                private static OrderBy(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    // sort during a thread, as the last in a theead, and at the end of threads if last
                    return [ { Op: "OrderBy", Args: args }]; // sort again at the end of the consolidated result                
                }

                private static OrderByDescending(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    // sort during a thread, as the last in a theead, and at the end of threads if last
                    return [ { Op: "OrderByDescending", Args: args }]; // sort again at the end of the consolidated result                
                }

                private static Reverse(args: Array<any>, statefulActivities: Array<Accelatrix_Tasks.Tasks.StatefulActivity<any>>, activityType: PackagedParallelActivityType)
                {
                    if (activityType == PackagedParallelActivityType.LastParallelActivityPostParallel)
                        return null; // no point it reversing something random

                    // sort during a thread, as the last in a theead, and at the end of threads if last
                    return [ { Op: "Reverse", Args: args }]; // sort again at the end of the consolidated result                
                }
            }            

            @Accelatrix_Serialization.Serialization.KnownType("Accelatrix.Collections.ParallelQuery.WaitingMembersPromise")
            class WaitingMembersPromise
            {
                constructor(statefulActivityId: string)
                {
                    Object.defineProperty(this, "StatefulActivityId", { enumerable: true, get: () => statefulActivityId, set: (value: string) => statefulActivityId = value });
                }

                public get StatefulActivityId()
                {
                    return null;
                }
            }

            type IEnumerableDescriptor = {
                                            readonly $type: string;
                                            Members: Array< LinearActivity | any>;
                                        };

            type LinearActivity = { Op: string, Args: Array<any> } | Function | Array<any>;

            type ParallelQueryDescriptor = { 
                                                IsArray: boolean,
                                                IsGenerator: boolean,
                                                Range: { Start: number, Count: number },
                                                Host: Array<any> | any,
                                                Structure: IEnumerableDescriptor,
                                                LinearActivitySequence: Array<LinearActivity >,
                                                DataSources: Array<{ LinearActivitySequence: number, Activity: LinearActivity, IsRootSource: boolean}>
                                            };           
        }

        /** An enumeration that runs in parallel. */
        export const ParallelQuery: { new<T> (arg: Array<T> | Accelatrix_Enumerable.Collections.IEnumerableOps<T> | (() => IterableIterator<T>)) : Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<T> } = ParallelQuerySystem.ParallelQuery as any;  

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(ParallelQuery.prototype.constructor, "name", { get: () => "ParallelQuery" });
    }
}
