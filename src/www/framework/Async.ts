/// <reference path="./Base.ts" />

import { Accelatrix as Accelatrix_Base } from "./Base";

export namespace Accelatrix
{
    /** Deals with asynchronous operations. */
    export namespace Async
    {
        /** An ongoing promise-like request that can be cancelled, along with the error and result callback. */
        export interface ICancellablePromise<T> extends PromiseLike<T>
        {
            /** Cancels an ongoing request by raising an AbortException. */
            Cancel(): void;

            /** Attaches a callback to the rejection of the promise. */
            Catch(onrejected: (exception: Accelatrix_Base.Exception) => void): ICancellablePromise<T>;

            /** Attaches a callback to the rejection of the promise. */
            catch(onrejected: (exception: Accelatrix_Base.Exception) => void): ICancellablePromise<T>;        

            /** Attaches callbacks for the resolution and/or rejection of the Promise. */
            Then(onfulfilled: (value: T) => void): ICancellablePromise<T>;

            /** An optional callback to invoke once the request is complete. */
            Finally(callback: () => void): ICancellablePromise<T>;
        }

        /** A cancellable promise that can be chained. */
        export interface IChainablePromise<T> extends ICancellablePromise<T>
        {
            /**
             * Chains a promise with a follow-up action and returns a new promise.
             * @param promise The promise to chain.
             * @param continueWith The follow-up action.
             * @returns Returns a chained promise.
             */            
            ContinueWith<TOut>(continueWith: (result: T) => TOut): IChainablePromise<TOut>;
            /**
             * Chains a promise with a follow-up action and extends the lifecycle of the current promise, thus merging with the continued with promise.
             * @param promise The promise to chain.
             * @param continueWith The follow-up action that produces another promise.
             * @param merge If the newly produced promise should be merged into the original.
             * @returns Returns a chained promise.
             */            
            ContinueWith<TOut>(continueWith: (result: T) => ICancellablePromise<TOut>, merge: boolean): IChainablePromise<TOut>;
        }

        /**
         * Chains a promise with a follow-up action and returns a new promise.
         * @param promise The promise to chain, or a value T that is to be promised.
         * @param continueWith The follow-up action.
         * @returns Returns a chained promise.
         */
        export function Chain<T, TOut>(promise: PromiseLike<T> | T, continueWith: (result: T) => TOut) : IChainablePromise<TOut>
        /**
         * Chains a promise with a follow-up action and extends the lifecycle of the current promise, thus merging with the continued with promise.
         * @param promise The promise to chain, or a value T that is to be promised.
         * @param continueWith The follow-up action that produces another promise.
         * @param merge If the newly produced promise should be merged with the original, thus extending the lifecycle of the original herein returned.
         * @returns Returns a chained promise.
         */
        export function Chain<T, TOut>(promise: PromiseLike<T> | T, continueWith: (result: T) => ICancellablePromise<TOut>, merge: boolean) : IChainablePromise<TOut>
        export function Chain<T, TOut>(promise: PromiseLike<T> | T, continueWith: (result: T) => TOut | ICancellablePromise<TOut>, merge?: boolean) : IChainablePromise<TOut>
        {
            var resolver: ((result: TOut) => void) | null;
            var rejector: ((exception: Error) => void) | null = ex => { console.error(ex); };
            var finalizer: (() => void) | null;
            var resolvedResult = undefined;

            promise = AsPromiseLike(promise as any);

            var canceller: () => void = () =>
            {
                try
                {
                    if (promise["Cancel"] != null)
                        promise["Cancel"]();
                    else
                    {
                        resolver = null;

                        try
                        {
                            if (rejector != null)
                                rejector(new Accelatrix_Base.AbortException());
                        }
                        catch(ex2)
                        {

                        }
                        finally
                        {
                            if (finalizer != null)
                                finalizer();
                        }
                    }
                }
                catch(ex)
                {
                }
                finally
                {
                    resolver = null;
                    rejector = null;
                    finalizer = null;
                    canceller = () => {};
                }
            };

            var hasChained = false;
            var myPromise = {

                            } as IChainablePromise<TOut>;

            var doChain = () =>
            {
                if (hasChained) return;

                hasChained = true;

                if (promise["catch"] != null)
                    (promise as Promise<T>).catch((exception: Error) =>
                    {
                        try
                        {
                            if (rejector != null)
                                rejector(exception);
                        }
                        catch(ex)
                        {
                            throw ex;
                        }
                        finally
                        {
                            canceller = resolver = rejector = () => {};
                            
                            if (finalizer != null)
                                finalizer;
                        }
                    });

                (promise as PromiseLike<T>).then(result =>
                {
                    var bypassFinally = false;

                    try
                    {
                        let followUp = continueWith(result);

                        if (merge && IsPromise(followUp))
                        {
                            continueWith = function(z: any) { return z};
                            promise = followUp as any as PromiseLike<T>;
                            hasChained = false;                            
                            merge = false;
                            doChain();
                            bypassFinally = true;                            
                            return;
                        }

                        resolvedResult = followUp as any;

                        if (resolver != null)
                            resolver(followUp as TOut);
                    }
                    catch(ex)
                    {
                        if (rejector != null)
                            rejector(ex as any);
                    }
                    finally
                    {
                        if (bypassFinally) return;

                        canceller = resolver = rejector = () => {};
                        
                        if (finalizer != null)
                            finalizer;
                    }
                });                
            }

            Object.defineProperty(myPromise, "then", { value: (onfulfilled: (result: TOut) => void) =>
            { 
                resolver = onfulfilled;

                if (!(resolvedResult === undefined))
                {
                    try
                    {
                        if (resolver != null)
                            resolver(resolvedResult === myPromise ? undefined : resolvedResult as any);
                    }
                    catch(ex)
                    {
                        if (rejector != null)
                            rejector(ex as any);
                        else
                            console.error(ex);
                    }
                }
                else
                    doChain();

                return myPromise;
            }});

            Object.defineProperty(myPromise, "Then", { value: (onfulfilled: (result: TOut) => void) =>
            { 
                return myPromise.then(onfulfilled);
            }});

            Object.defineProperty(myPromise, "catch", { value: (onRejected: (exception: Error) => void) =>
            { 
                rejector = onRejected;
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Catch", { value: (onRejected: (exception: Error) => void) =>
            { 
                rejector = onRejected;
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Finally", { value: (onFinally: () => void) =>
            { 
                finalizer = onFinally;
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Cancel", { value: () =>
            { 
                canceller();
            }});

            Object.defineProperty(myPromise, "ContinueWith", { value: (continueWith: (result: T) => TOut | ICancellablePromise<TOut>, merge?: boolean) =>
            { 
                return Async.Chain(myPromise, continueWith as any, merge as any);
            }});

            //add other properties
            //const blackList = [ "then", "Then", "catch", "Catch", "Finally", "finally", "ContinueWith", "Cancel"];
            //Object.keys(promise).Except(blackList).ForEach(z => myPromise[z] = promise[z] );
            if (promise["Blocking"] != null) myPromise["Blocking"] = promise["Blocking"];

            return myPromise;            
        }

        /**
         * Wraps any object into a self-resolving Promise that is chainable. As such, .then() should be the last method to reference and .catch() should be first.
         * @param obj The object to wrap.
         * @returns Returns the self-resolving chainable Promise.
         */
        export function AsPromise<T>(obj: T): IChainablePromise<T>
        /**
         * Wraps any object into a Promise that resolves after a given timeout in milliseconds.
         * @param obj The object to wrap.
         * @param resolveAfter The timeout for the promise to resolve.
         * @returns Returns the chainable Promise.
         */
        export function AsPromise<T>(obj: T, resolveAfter: number): IChainablePromise<T>
        export function AsPromise<T>(obj: T, resolveAfter?: number): IChainablePromise<T>
        {
            if (IsPromise(obj))
            {
                if (obj["ContinueWith"] == null)
                    Object.defineProperty(obj, "ContinueWith", { value: (continueWith: (result: T) => any, merge?: boolean) =>
                    { 
                        return Async.Chain(thePromise as any, continueWith as any, merge as any);
                    }});

                return obj as any as IChainablePromise<T>;
            }                

            // value is scalar
            let theResolver: (value: T) => void;
            let theRejector: (ex: Accelatrix_Base.Exception) => void = ex => console.error(ex);
            let finallizer: () => void = () => {};

            let cancelled = false;
            var thePromise = {
                                 then: (onFullfilled: (result: T) => void) =>
                                                      { 
                                                          theResolver = onFullfilled;

                                                          if (!cancelled)
                                                          {
                                                            try
                                                            {
                                                                if (resolveAfter == null || resolveAfter < 0)
                                                                {
                                                                    if (theResolver != null)
                                                                        theResolver(obj);
                                                                }
                                                                else
                                                                {
                                                                    setTimeout(() =>
                                                                               {
                                                                                    if (theResolver != null)
                                                                                        theResolver(obj);
                                                                               }, resolveAfter);
                                                                }
                                                            }
                                                            catch(ex)
                                                            {
                                                                if (theRejector != null)
                                                                    theRejector(ex as any);
                                                            }
                                                            finally
                                                            {
                                                                if (finallizer != null)
                                                                    finallizer();

                                                                // theRejector = theResolver = finallizer = () => {};
                                                            }
                                                          }
                                                          return thePromise;
                                                      },

                                 catch: (onerror: (ex: Error) => void) =>
                                        {
                                            theRejector = onerror;          
                                            return thePromise;
                                        },

                                 Cancel: () =>
                                         {
                                            cancelled = true;

                                            try
                                            {
                                                if (theRejector != null)
                                                    theRejector(new Accelatrix_Base.AbortException());
                                            }
                                            catch(ex)
                                            {

                                            }
                                            finally
                                            {
                                                if (finallizer != null)
                                                    finallizer();

                                                // theRejector = theResolver = finallizer = () => {};
                                            }
                                         }
                             };

            thePromise["Then"] = thePromise.then;
            thePromise["Catch"] = thePromise.catch;            

            Object.defineProperty(thePromise, "ContinueWith", { value: (continueWith: (result: T) => any, merge?: boolean) =>
            { 
                return Async.Chain(thePromise as any, continueWith as any, merge as any);
            }});

            return thePromise as any as IChainablePromise<T>;
        }

        /**
         * Wraps/ensure a simple promise.
         * @param obj The object to wrap.
         */
        function AsPromiseLike<T>(obj: T): PromiseLike<T>
        {
            if (IsPromise(obj))
                 return obj as any as PromiseLike<T>;             
    
            // value is scalar
            let theResolver: (value: T) => void;
            var thePromise = {
                                then: (onFullfilled: (result: T) => void) =>
                                                     { 
                                                        theResolver = onFullfilled;

                                                        try
                                                        {
                                                            if (theResolver != null)
                                                                theResolver(obj);
                                                        }
                                                        catch(ex)
                                                        {
                                                            throw ex;
                                                        }
                                                        finally
                                                        {
                                                            theResolver = () => {};
                                                        }

                                                        return thePromise;
                                                     },

                                    catch: (onerror: (ex: Error) => void) => thePromise,
                                };      

            return thePromise as any as PromiseLike<T>;
        }

        /**
         * Indicates if a given object's instance is a promise.
         * @param obj Tje object to test.
         * @returns Returns if the given object's instance is a promise.
         */
        export function IsPromise(obj: any)
        {
            return obj != null && obj["then"] != null && obj["then"] instanceof Function;
        }

        /**
         * Combines multiple promises into a single promise.
         * @param promises The promises to combine.
         * @returns Returns the overarching promise.
         */
        export function CombineAll<T>(promises: PromiseLike<T>[]): IChainablePromise<Array<T>>
        {
            if (promises == null || !promises.Any())
                return AsPromise([]);

            var work: Array<{ Canceller: () => void, Result: T, Done: boolean }> = [];
            var cancelAll = () =>
                            {
                                work.Where(z => z.Canceller != null)
                                    .ForEach(z =>
                                    {
                                        try
                                        {
                                            z.Canceller();
                                        }
                                        catch(ex)
                                        {
                                        }
                                        finally
                                        {
                                            z.Canceller = null;
                                        }
                                    });
                            };
            var resolver: ((result: Array<T>) => void) | null;
            var rejector: ((exception: Error) => void) | null = ex => { console.error(ex); };
            var finalizer: (() => void) | null;
            var canceller: (() => void) | null = () =>
            {
                try
                {
                    if (rejector != null)
                        rejector(new Accelatrix_Base.AbortException());
                }
                catch(ex)
                {
                }
                finally
                {
                    resolver = null;
                    rejector = null;
                    finalizer = null;
                    canceller = () => {};
                    cancelAll();
                }
            };

            var myPromise = {

                            } as IChainablePromise<T>;

            var doChain = () =>
            {
                if (work.length > 0) return;

                promises.Select(z => AsPromiseLike(z) as any as ICancellablePromise<T>)
                        .ForEach(z =>
                        {
                            var workEntry = { Canceller: z.Cancel, Result: undefined, Done: false };
                            work.push(workEntry as any);

                            if (z["catch"] != null)
                                z.catch(ex =>
                                {
                                    workEntry.Canceller = null as any;
                                    workEntry.Done = true;

                                    try
                                    {
                                        if (rejector != null)
                                            rejector(ex);
                                    }
                                    catch(ex)
                                    {
                                        console.error(ex);
                                    }
                                    finally
                                    {
                                        try
                                        {
                                            if (finalizer != null)
                                                finalizer();
                                        }
                                        catch(ex2)
                                        {
                                        }

                                        resolver = null;
                                        rejector = null;
                                        finalizer = null;
                                        canceller = () => {};
                                        cancelAll();
                                    }
                                });

                            z.then(r =>
                            {
                                workEntry.Canceller = null as any;
                                workEntry.Result = r as any;
                                workEntry.Done = true;

                                if (work.length >= promises.length && !work.Where(w => !w.Done).Any())
                                {
                                    try
                                    {
                                        if (resolver != null)
                                            resolver(work.Select(w => w.Result).ToList());   
                                    }
                                    catch(ex)
                                    {
                                        if (rejector != null)
                                            rejector(ex as any);
                                    }
                                    finally
                                    {
                                        try
                                        {
                                            if (finalizer != null)
                                                finalizer();
                                        }
                                        catch(ex2)
                                        {
                                        }
    
                                        resolver = null;
                                        rejector = null;
                                        finalizer = null;
                                        canceller = () => {};
                                        cancelAll();
                                    }
                                }
                            });
                        });
            }

            Object.defineProperty(myPromise, "then", { value: (onfulfilled: (result: T[]) => void) =>
            { 
                resolver = onfulfilled;
                doChain();
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Then", { value: (onfulfilled: (result: T[]) => void) =>
            { 
                resolver = onfulfilled;
                doChain();
                return myPromise;
            }});

            Object.defineProperty(myPromise, "catch", { value: (onRejected: (exception: Error) => void) =>
            { 
                rejector = onRejected;
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Catch", { value: (onRejected: (exception: Error) => void) =>
            { 
                rejector = onRejected;
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Finally", { value: (onFinally: () => void) =>
            { 
                finalizer = onFinally;
                return myPromise;
            }});

            Object.defineProperty(myPromise, "Cancel", { value: () =>
            { 
                if (canceller != null)
                    canceller();
            }});

            Object.defineProperty(myPromise, "ContinueWith", { value: (continueWith: (result: T) => any, merge?: boolean) =>
            { 
                return Async.Chain(myPromise, continueWith as any, merge as any);
            }});

            return myPromise as any;
        }
    }
}
