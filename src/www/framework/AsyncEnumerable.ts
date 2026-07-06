/// <reference path="./Base.ts" />
/// <reference path="./Enumerable.ts" />

import { Accelatrix as Accelatrix_Base } from "./Base";
import { Accelatrix as Accelatrix_Number } from "./Number";
import { Accelatrix as Accelatrix_Enumerable } from "./Enumerable";
import { Accelatrix as Accelatrix_Serialization } from "./Serialization";
import { Accelatrix as Accelatrix_Async } from "./Async";
import { Accelatrix as Accelatrix_Type } from "./Type";
import { Accelatrix as Accelatrix_Collections } from "./Collections";

export namespace Accelatrix
{
    export namespace Collections
    {    
        /** An enumeration that runs in parallel. */
        export interface IEnumerableAsyncOps<T> extends Accelatrix_Enumerable.Collections.IEnumerable<T>
        {
            /** Freezes the current enumeration so that the position of the iterator is retained during subsquent calls. */
            Freeze(): IEnumerableAsyncOps<T>;

            /** Wraps the enumeration. */
            ToEnumerable(): IEnumerableAsyncOps<IEnumerableAsyncOps<T>>;            

            /** Gets if the sequence contains any elements. */
            Any(): Accelatrix_Async.Async.IChainablePromise<boolean>;

            /** Gets if the sequence does not contain any elements. */
            NotAny(): Accelatrix_Async.Async.IChainablePromise<boolean>;            

            /** If a given element exists within the enumeration. */
            Contains(element: T | PromiseLike<T>): Accelatrix_Async.Async.IChainablePromise<boolean>;

            /** If a given element does not exist within the enumeration. */
            NotContains(element: T | PromiseLike<T>): Accelatrix_Async.Async.IChainablePromise<boolean>;            
            
            /** Gets the first element of a sequence, or null if empty, but the order is random and not necessarily the order at input. */
            FirstOrNull(): Accelatrix_Async.Async.IChainablePromise<T | null>;

            /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
            LastOrNull(): Accelatrix_Async.Async.IChainablePromise<T | null>;

            /**
            * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
            * @param keySelector A function to extract the key from each element.
            * @param valueSelector A function to extract the value from each element.
            */        
            ToDictionary<TKey, TOut>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix_Collections.Collections.IHashMap<TKey, TOut>;

            /** Commits an enumeration as a typed list and gives the count of memebers. */
            Count():  Accelatrix_Async.Async.IChainablePromise<number>;

            /** Sums all quantitative items in the collection. */
            Sum<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>>(): Accelatrix_Async.Async.IChainablePromise<T>;
            /**
            * Sums all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Sum<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>>(selector?: (element: T, index?: number) => TOut): Accelatrix_Async.Async.IChainablePromise<TOut>;

            /** Averages all quantitative items in the collection. */
            Average<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>():  Accelatrix_Async.Async.IChainablePromise<T>;
            /**
            * Averages all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Average<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(selector?: (element: T, index?: number) => TOut): Accelatrix_Async.Async.IChainablePromise<TOut>;

            /** Max of all quantitative items in the collection. */
            Max<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>():  Accelatrix_Async.Async.IChainablePromise<T>;
            /**
            * Max of all quantitative items in the collection.
            * @param comparer An optional comparer.
            */
            Max(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): Accelatrix_Async.Async.IChainablePromise<T>;

            /**
            * Min of all quantitative items in the collection.
            */
            Min<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>():  Accelatrix_Async.Async.IChainablePromise<T>;
            /**
            * Min of all quantitative items in the collection.
            * @param comparer An optional comparer.
            */
            Min(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>):  Accelatrix_Async.Async.IChainablePromise<T>;

            /**
             * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
             * @param typeConstructor The type constructor, e.g. the reference to the class definition.
             */
            OfType<TFilter>(typeConstructor: { new (...args: any[]): TFilter }): IEnumerableAsyncOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param type The Accelatrix.Type of the type to filter.
             */
            OfType<TFilter>(type: Accelatrix_Type.Type): IEnumerableAsyncOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param typeName The name or full name of the type.
             */
            OfType<TFilter>(typeName: string): IEnumerableAsyncOps<TFilter>;

            /** Commits an enumeration as a typed list. */
            ToList(): Accelatrix_Async.Async.IChainablePromise<Accelatrix_Enumerable.Collections.IEnumerableOps<T>>;

            /**
            * Concatenates one sequence after the existing.
            *
            * @param second The second enumeration.
            */
            Concat(second: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T> | PromiseLike<Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>>): IEnumerableAsyncOps<T>;

            /**
            * Projects each element of a sequence into a new form.
            * @param selector The projection function.
            */
            Select<TOut>(selector: (element: T, index?: number) => TOut | PromiseLike<T>): IEnumerableAsyncOps<TOut>;

            /**
            * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children).
            * @param selector The projection function.
            */
            SelectMany<TOut>(selector: (element: T, index?: number) => Accelatrix_Enumerable.Collections.IEnumerableOps<TOut>): IEnumerableAsyncOps<TOut>;

            /**
            * Filters a sequence of values based on a predicate.
            * @param selector The selector function.
            */
            Where(selector: (element: T, index?: number) => boolean | PromiseLike<boolean>): IEnumerableAsyncOps<T>;

            /** Produces a new enumeration in reverse order, which implies that the enumeration is finite. */
            Reverse(): IEnumerableAsyncOps<Array<T>>;

            /** Gets all entries which are not null, and in string enumerations, not empty or white spaces. */
            NotNullOrEmpty(): IEnumerableAsyncOps<T>;

            /**
            * Sorts the sequence is ascending order.
            * @param comparer The sorting criteria;
            */
            OrderBy(comparer?: (a: T, b: T) => number | any): IEnumerableAsyncOps<Array<T>>;

            /**
            * Sorts the sequence in descending order.
            * @param comparer The sorting criteria.
            */
            OrderByDescending(comparer?: (a: T, b: T) => number | any): IEnumerableAsyncOps<Array<T>>;

            /**
            * Get the distinct members, which relies on Equals().
            * @param equalityComparer An optional comparer.
            */
            Distinct(equalityComparer?: (a: T, b: T) => boolean): IEnumerableAsyncOps<T>;

            /** Takes elements of a sequence until a duplicate is found, which relies on Equals(). */
            TakeWhileDistinct(): IEnumerableAsyncOps<T>;

            /** Skips elements of a sequence until a duplicate is found, which relies on Equals(). */
            SkipWhileDistinct(): IEnumerableAsyncOps<T>;

            /**
            * Groups the items in a collection based, and produces a map/dictionary where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
            * @param keySelector The group by criterion.
            */        
            GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerableAsyncOps<Accelatrix_Enumerable.Collections.IGrouping<TIn, T>>;

            /**
            * Produces the intersection of two sequences.
            * @param sequence The sequence to intersect.
            */
            Intersect(sequence: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;

            /**
            * Produces the exclusion of elements from a sequence.
            * @param sequence The sequence to subtract.
            */
            Except(sequence: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;

            /**
            * Produces the set union of two sequences by using the default equality comparer.
            * Different from Concat since only distinct members of the second sequence will end up in the new enumeration.    
            * @param sequence The sequence to union.
            */
            Union(sequence: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;

            /**
            * Bypasses a specified number of contiguous elements from the start of the sequence.
            * @param count The number of elements to bypass.
            */
            Skip(count: number): IEnumerableAsyncOps<T>;

            /**
            * Returns a specified number of contiguous elements from the start of the sequence.
            * @param count The number of elements to take.
            */
            Take(count: number): IEnumerableAsyncOps<T>;

            /**
            * Skips the sequence while a condition is true.
            * @param condition The condition that while true will skip the member.
            */
            SkipWhile(condition: (member: T) => boolean): IEnumerableAsyncOps<T>;

            /**
            * Returns a specified number of contiguous elements from the start of the sequence.
            * @param condition The selector of elements to take.
            */
            TakeWhile(condition: (item: T) => boolean): IEnumerableAsyncOps<T>;

            /**
             * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
             * @param second The sequence to zip.
             * @param resultSelector The predicate that joins an element of T and another of Tsecond and creates a TOut.
             */            
            Zip<TSecond, TOut>(second: Accelatrix_Enumerable.Collections.IEnumerableOps<TSecond> | IEnumerableAsyncOps<TSecond>, resultSelector?: (element: T, second: TSecond, index?: number) => TOut | PromiseLike<TOut>): IEnumerableAsyncOps<TOut>;

            /**
            * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
            * @param second The second enumeration to interleave with.
            */
            Interleave(second:  Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;

            /**
            * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
            * @param keySelector A function to extract the key from each element.
            * @param valueSelector A function to extract the value from each element.
            */        
            ToDictionary<TKey, TOut extends IEnumerableAsyncOps<any>>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix_Collections.Collections.IHashMap<TKey, Accelatrix_Enumerable.Collections.IEnumerableOps<TOut>>;
        }

        // Cope from EnumerableSerialization
        namespace EnumerableSerialization
        {
            function RegisterMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor, argumentIsTypeOrConstructor?: boolean)
            {
                var original = descriptor.value as Function;
                // Object.defineProperty(original, "name", { get:() => propertyKey });
                                    
                //register
                var f = function (...args)
                {
                    //EnumerableSerialization.RegisterMethod(this, propertyKey, args)
                    let result = original.apply(this, args);

                    let parentOJson = this["toJSON"].bind(this);
                    result["toJSON"] = function()
                    {
                        /*
                        let parent = parentOJson() as string;
                        parent = parent.substring(0, parent.length - 2);
                        let myObj = { Op: propertyKey, Args: args };
                        let myJSON = Accelatrix_Serialization.Serialization.ToJSON(myObj);
                        return parent + "," +  myJSON + "]}";
                        */
                        let parent = parentOJson();

                        var myArgs = argumentIsTypeOrConstructor == null || argumentIsTypeOrConstructor !== true
                                     ? args
                                     : args.ToList();

                        if (argumentIsTypeOrConstructor === true && myArgs.Any() && myArgs[0] != null)
                        {
                            let typeOrConstructor = myArgs[0];
                            let typeOrConstructorType = typeOrConstructor.GetType()

                            if (typeOrConstructorType.Name == "String")
                            {
                                // no need to do anything
                            }
                            else if (typeOrConstructorType.IsFunction)
                            {
                                var typeName = Accelatrix_Type.Type.FromConstructor(typeOrConstructor as any).GetFullName();
                                myArgs[0] = typeName;
                            }
                            else
                            {
                                var typeName = (typeOrConstructor as Accelatrix_Type.Type).GetFullName();
                                myArgs[0] = typeName;
                            }                        
                        }

                        parent["Members"].push({ Op: propertyKey, Args: myArgs });
                        return parent;
                    };

                    return result;
                }
                
                // Object.defineProperty(f, "name", { get:() => propertyKey });

                descriptor.value = f;        
            }

            export function DataMember()
            export function DataMember(argumentIsTypeOrConstructor: boolean)
            export function DataMember(argumentIsTypeOrConstructor?: boolean)
            {
                return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
                {
                    return RegisterMethod(target, propertyKey, descriptor, argumentIsTypeOrConstructor);
                };
            }    
        }

        namespace AsyncEnumerableSystem
        {
            const CONCURRENCY_LEVEL = 8; //8; // the number of simultaneous async operations.

            /** An enumeration that runs in parallel. */
            @Accelatrix_Serialization.Serialization.KnownType("Accelatrix.Collections.AsyncEnumerable")
            export class AsyncEnumerable<T> extends Accelatrix_Enumerable.Collections.Enumerable<T>
            {
                public constructor(enumerable: Accelatrix_Enumerable.Collections.IEnumerableOps<T | PromiseLike<T>> | IEnumerableAsyncOps<T> | (() => IterableIterator<T | PromiseLike<T>>))
                {
                    super(IsPromise(enumerable)
                            ? new AsyncEnumerable([]).Concat(enumerable as any) as any // wrap promises: just in case
                            : enumerable as any);

                    // ------  Redefine GetEnumerator() to automatically skip over "undefined" -------
                    RedefineGetEnumerator(this);
                }           
                
                public ForEach(action: (element: T, index?: number) => boolean | void | any): { Cancel: () => void, Finally: (onfinished: (exception?: Accelatrix_Base.Exception) => void) => void }
                {
                    var myEnumerator = this.GetEnumerator();
                    var index = 0;
                    var concurrency = 0;
                    var proceed = true;
                    var cancellers : Array<() => { }> = [];
                    var finalizer: (exception?: Accelatrix_Base.Exception) => void;

                    var timer = setTimeout(assessAndContinue, 0);

                    var handler = {
                                    Cancel: () =>
                                    {
                                        clearTimeout(timer);
                                        proceed = false;

                                        try
                                        {
                                            if (finalizer != null)
                                                finalizer(new Accelatrix_Base.AbortException());
                                        }
                                        catch(ex)
                                        {
                                            throw ex;
                                        }
                                        finally
                                        {
                                            finalizer = null;
                                            handler.Cancel = () => {};

                                            cancellers.Where(z => z != null).ForEach(z =>
                                            {
                                                try
                                                {
                                                    z();
                                                }
                                                catch(ex)
                                                {

                                                }
                                            });

                                            cancellers = [];
                                        }
                                    },

                                    Finally: (onFinished: (exception?: Accelatrix_Base.Exception) => void) =>
                                    {
                                        finalizer = onFinished;
                                        clearTimeout(timer);
                                        assessAndContinue();

                                        return handler;
                                    }
                                 };


                    /*
                    var assessAndContinue = () =>
                    {
                        if (!proceed)
                        {
                            if (finalizer != null)
                                finalizer();

                            finalizer = null;
                            handler.Cancel();

                            return;
                        }

                        if (!myEnumerator.MoveNext())
                        {
                            if (concurrency <= 0) // otherwise a pending resolver will come back here
                            {
                                if (finalizer != null)
                                    finalizer();

                                finalizer = null;
                                handler.Cancel();                           
                            }

                            return;
                        }                        

                        if (!IsPromise(myEnumerator.Current))
                        {
                            try
                            {
                                var result = action == null
                                             ? true
                                             : action(myEnumerator.Current, index++);

                                proceed = result == null || !(result === false);                                

                                assessAndContinue();
                            }
                            catch(ex)
                            {
                                proceed = false;

                                if (finalizer != null)
                                    finalizer(ex);                            
                                else
                                    console.error(ex);
                                
                                finalizer = null;
                                handler.Cancel();
                            }
                        }
                        else
                        {
                            var cancellerIndex = cancellers.length;
                            cancellers.push(myEnumerator.Current == null ? null : myEnumerator.Current["Cancel"]);
                            
                            if (myEnumerator.Current != null && myEnumerator.Current["catch"] != null && myEnumerator.Current["catch"] instanceof Function)
                                myEnumerator.Current["catch"](ex =>
                                {
                                    cancellers[cancellerIndex] = null;
                                    proceed = false;

                                    if (finalizer != null)                                
                                        finalizer(ex);                            
                                    else
                                        console.error(ex);

                                    finalizer = null;
                                    handler.Cancel();
                                });

                            concurrency++;

                            (myEnumerator.Current as any as PromiseLike<T>).then(r =>
                                                                                {
                                                                                    concurrency--;
                                                                                    cancellers[cancellerIndex] = null;

                                                                                    if (r === undefined)
                                                                                    {
                                                                                        // ignore
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        try
                                                                                        {
                                                                                            var result = action == null
                                                                                                         ? true
                                                                                                         : action(r, index++);
                                                                
                                                                                            proceed = result == null || !(result === false);
                                                                                        }
                                                                                        catch(ex)
                                                                                        {
                                                                                            proceed = false;

                                                                                            if (finalizer != null)                                
                                                                                                finalizer(ex);                            
                                                                                            else
                                                                                                console.error(ex);

                                                                                            finalizer = null;
                                                                                            handler.Cancel();
                                                                                        }
                                                                                    }

                                                                                    assessAndContinue();
                                                                                });
                            if (concurrency < CONCURRENCY_LEVEL)
                                assessAndContinue();
                        }
                    }
                    */

                    var finalise = (ex?: Accelatrix_Base.Exception) =>
                                   {
                                        proceed = false;

                                        if (finalizer != null)
                                            finalizer(ex);
                                        else if (ex != null)
                                            console.error(ex);

                                        finalizer = null;
                                        handler.Cancel();
                                        finalise = () => {};
                                   };
                    
                    var assessAndContinue = () =>
                    {
                        // --- called by async
                        if (!proceed)
                        {
                            finalise();
                            return;
                        }

                        // -- called by async and no more elements
                        if (!myEnumerator.MoveNext())
                        {
                            if (concurrency <= 0) // otherwise a pending resolver will come back here
                                finalise();

                            return;
                        }
                        
                        while (proceed)
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                try
                                {
                                    var result = action == null
                                                 ? true
                                                 : action(myEnumerator.Current, index++);
    
                                    proceed = result == null || !(result === false);                                
    
                                    if (!proceed)
                                    {
                                        finalise();
                                        return;
                                    }                                        
                                }
                                catch(ex)
                                {
                                    finalise(ex);
                                    return;
                                }

                                 // Move next and finalise if applicable.
                                if (!myEnumerator.MoveNext())
                                {
                                    proceed = false;

                                    if (concurrency <= 0) // otherwise a pending resolver will call assessAndContinue() and finalise itself
                                        finalise();

                                    break; // stop iterating always
                                }
                            }
                            else // a Promise
                            {
                                var cancellerIndex = cancellers.length;
                                cancellers.push(myEnumerator.Current == null ? null : myEnumerator.Current["Cancel"]);
                                
                                if (myEnumerator.Current != null && myEnumerator.Current["catch"] != null && myEnumerator.Current["catch"] instanceof Function)
                                    myEnumerator.Current["catch"](ex =>
                                    {
                                        cancellers[cancellerIndex] = null;
                                        finalise(ex);
                                    });
    
                                concurrency++;
                                
                                let isBlocking = myEnumerator.Current["Blocking"] === true;

                                (myEnumerator.Current as any as PromiseLike<T>).then(r =>
                                                                                    {
                                                                                        concurrency--;
                                                                                        cancellers[cancellerIndex] = null;
    
                                                                                        if (r === undefined)
                                                                                        {
                                                                                            try
                                                                                            {
                                                                                                assessAndContinue();
                                                                                            }
                                                                                            catch(ex)
                                                                                            {
                                                                                                finalise(ex);
                                                                                            }
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            try
                                                                                            {
                                                                                                var result = action == null
                                                                                                             ? true
                                                                                                             : action(r, index++);
                                                                    
                                                                                                proceed = result == null || !(result === false);

                                                                                                assessAndContinue();
                                                                                            }
                                                                                            catch(ex)
                                                                                            {
                                                                                                finalise(ex);
                                                                                            }
                                                                                        }                                                                                        
                                                                                    });

                                if (concurrency >= CONCURRENCY_LEVEL || isBlocking)
                                    break; // stop cycle and let a pending Promise resume 
                                else
                                {
                                    // Move next and finalise if applicable.
                                    if (!myEnumerator.MoveNext())
                                    {
                                        proceed = false;

                                        if (concurrency <= 0) // otherwise a pending resolver will call assessAndContinue() and finalise itself
                                            finalise();

                                        break; // stop iterating 
                                    }                                    
                                }
                            }
                        }
                    }

                    return handler;
                }

                public ForAll<TOut>(action: (element: T, index?: number) => TOut)
                {
                    return this.ToList().ContinueWith(z => z.ForAll(action) , true);                    
                }

                public Any()
                {
                    return Accelatrix_Async.Async.Chain(this.FirstOrNull(), r => !(r === undefined)) as any;
                }

                public NotAny()
                {
                    return Accelatrix_Async.Async.Chain(this.FirstOrNull(), r => (r === undefined)) as any;
                }                

                public ToList()
                {
                    var result = [];

                    if (this["Key"] != null)
                    {
                        var key = this["Key"];
                        Object.defineProperty(result, "Key", { get: () => key, enumerable: true });
                    }

                    var myPromise = {};
                    var myResolver: (result: Array<T>) => void;
                    var myRejector: (exception: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                    var finalizer: () => void;
                    var canceller = () => { 
                                            myPromise["then"] = myPromise["Then"] = () => { }; 
                                            if (myRejector != null)
                                                myRejector(new Accelatrix_Base.AbortException());

                                            if (finalizer != null)
                                                finalizer();

                                            finalizer = myRejector = myResolver = canceller = () => {};
                                          };

                    var hasStarted = false;

                    var doer = () =>
                    {
                        if (hasStarted) return;

                        hasStarted = true;

                        var handler = this.ForEach(z => result.push(z));

                        canceller = handler.Cancel;
    
                        handler.Finally((exception?: Accelatrix_Base.Exception) =>
                        {
                            try
                            {
                                if (exception != null)
                                {
                                    if (myRejector != null)
                                        myRejector(exception);
                                }
                                else
                                {
                                    if (myResolver != null)
                                        myResolver(result);
                                }
                            }
                            catch(ex)
                            {
                                if (myRejector != null)
                                    myRejector(ex);
                            }
                            finally
                            {
                                canceller = myRejector = myResolver = () => { };
    
                                if (finalizer != null)
                                    finalizer();
    
                                finalizer = () => { };
                            }
                        });                        
                    }

                    Object.defineProperty(myPromise, "then", { value: (onFullfilled: (result: Array<T>) => void) =>
                    {
                        myResolver = onFullfilled;
                        doer();
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Then", { value: (onFullfilled: (result: Array<T>) => void) =>
                    {
                        myResolver = onFullfilled;
                        doer();
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "catch", { value: (onrejected: (exception:Accelatrix_Base.Exception) => void) =>
                    {
                        myRejector = onrejected;
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Catch", { value: (onrejected: (exception:Accelatrix_Base.Exception) => void) =>
                    {
                        myRejector = onrejected;
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Finally", { value: (onFinished: () => void) =>
                    {
                        finalizer = onFinished;
                        doer();
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Cancel", { value: () =>
                    {
                        if (canceller != null)
                            canceller();
                    }});                    

                    Object.defineProperty(myPromise, "ContinueWith", { value: (continueWith: (result: any) => any, merge?: boolean) =>
                    { 
                        return Accelatrix_Async.Async.Chain(myPromise, continueWith as any, merge);
                    }});

                    return myPromise as Accelatrix_Async.Async.IChainablePromise<Array<T>> as any;
                }

                public Count()
                {
                    return Accelatrix_Async.Async.Chain(this.ToList() as any as PromiseLike<Array<T>>, r => r.length) as any;
                }
        
                /** Freezes the current enumeration so that the position of the iterator is retained during subsquent calls. */
                public Freeze()
                {
                    var me = this;

                    Object.defineProperty(me, "Freeze", { value: () => me, enumerable: false, configurable: true });

                    var myEnumerator = me.GetEnumerator();

                    Object.defineProperty(me, "GetEnumerator", { value: () => myEnumerator, enumerable: false, configurable: true });

                    var myFirstOrNull = me.FirstOrNull.bind(me);

                    Object.defineProperty(me, "Any", { value: () =>
                    {
                        var promise = myFirstOrNull() as PromiseLike<T>;
                        return Accelatrix_Async.Async.Chain(promise,
                                                                   r =>
                                                                   {
                                                                      if (r === undefined) return false;

                                                                      myEnumerator = new (me as any).constructor([r]).Concat(({ GetEnumerator: () => myEnumerator })).GetEnumerator();

                                                                      return true;
                                                                   }
                        )                        
                    }, enumerable: false, configurable: true });
                                
                    return me;
                }
                
                @EnumerableSerialization.DataMember()
                public Select<TOut>(selector: (element: T, index?: number) => TOut | PromiseLike<TOut>)
                {
                    var me = this;
        
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var index = 0;
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                var selectorResult = selector == null
                                                     ? myEnumerator.Current
                                                     : selector(myEnumerator.Current,
                                                                myEnumerator.Current === undefined ? index : index++);

                                yield selectorResult;
                            }
                            else
                            {
                                yield Accelatrix_Async.Async.Chain(myEnumerator.Current,
                                                                   r =>
                                                                   {
                                                                        if (r === undefined)
                                                                          return r;

                                                                        var selectorResult = selector == null
                                                                                             ? r
                                                                                             : selector(r, index++);

                                                                        if (!IsPromise(selectorResult))
                                                                            return selectorResult as any;
                                                                        else
                                                                            return Accelatrix_Async.Async.Chain(selector,
                                                                                                                r2 => r2 === undefined
                                                                                                                      ? undefined
                                                                                                                      : r2(r));
                                                                   },
                                                                   true);
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery   
                }

                @EnumerableSerialization.DataMember()
                public Where(selector: (element: T, index?: number) => boolean | PromiseLike<boolean>)
                {
                    var me = this;
        
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var index = 0;
            
                        if (selector == null) selector = (a, b) => true;
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                var selectorResult = selector(myEnumerator.Current, index++);

                                if (!IsPromise(selectorResult))
                                {
                                    if (selectorResult == true) yield myEnumerator.Current
                                }
                                else
                                    yield Accelatrix_Async.Async.Chain(selectorResult,
                                                                        r => r === undefined || r != true
                                                                             ? undefined
                                                                             : myEnumerator.Current)
                            }
                            else
                            {
                                yield Accelatrix_Async.Async.Chain(myEnumerator.Current,
                                                                   r =>
                                                                   {                                                                    
                                                                        if (r === undefined)
                                                                            return undefined;

                                                                        var selectorResult = selector(r, index++);

                                                                        if (!IsPromise(selectorResult))
                                                                        {
                                                                            return r === undefined || selectorResult == false
                                                                                   ? undefined
                                                                                   : r as any                                                                               
                                                                        }
                                                                        else
                                                                        {
                                                                            var selectorPromise = selectorResult;
                                                                            return Accelatrix_Async.Async.Chain(selectorPromise,
                                                                                                                r2 => r2 === undefined || !r2
                                                                                                                      ? undefined
                                                                                                                      : r);
                                                                        }
                                                                   },
                                                                   true);
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery                
                }

                @EnumerableSerialization.DataMember(true)
                public OfType<TFilter>(typeConstructorOrType: { new (...args: any[]): TFilter } | Accelatrix_Type.Type | string)
                {
                    return this.Where(z => !IsPromise(z)
                                           ? z != null && z.GetType().IsOfType(typeConstructorOrType)
                                           : Accelatrix_Async.Async.Chain(z,
                                                                          r =>
                                                                          {
                                                                              return r === undefined
                                                                                     ? undefined
                                                                                     : r != null && r.GetType().IsOfType(typeConstructorOrType)
                                                                          }));
                }

                @EnumerableSerialization.DataMember()
                public SelectMany<TOut>(selector: (element: T, index?: number) => Accelatrix_Enumerable.Collections.IEnumerableOps<TOut> | IEnumerableAsyncOps<TOut>)
                {
                    var me = this;
            
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var index = 0;
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                var children = selector == null
                                               ? new (me as any).constructor(<Array<TOut>><any>myEnumerator.Current)
                                               : new (me as any).constructor(selector(myEnumerator.Current, index++));

                                var childEnumerator = children.GetEnumerator() as Accelatrix_Enumerable.Collections.IEnumerator<T>;

                                while (childEnumerator.MoveNext())
                                    yield childEnumerator.Current;
                            }
                            else
                            {
                                var myEntryPromise = myEnumerator.Current;
                                var childEnumerator: Accelatrix_Enumerable.Collections.IEnumerator<T> = null;

                                while (childEnumerator == null)
                                {
                                    var myPromise = Accelatrix_Async.Async.Chain(myEntryPromise,
                                                                                 r =>
                                                                                 {
                                                                                    if (childEnumerator == null)
                                                                                    {
                                                                                        var children = r === undefined
                                                                                                       ? [ r ]
                                                                                                       : selector == null
                                                                                                            ? new (me as any).constructor(<Array<TOut>><any>r)
                                                                                                            : new (me as any).constructor(selector(r, index++));

                                                                                        childEnumerator = children.GetEnumerator();
                                                                                    }

                                                                                    childEnumerator.MoveNext(); // may return undefined as the end has been reached

                                                                                    return childEnumerator.Current;
                                                                                 });
                                    yield myPromise;                                
                                }

                                while (childEnumerator.MoveNext())
                                {
                                    yield childEnumerator.Current;
                                }
                            }
                        }
                    } as () => IterableIterator<TOut>
            
                    //return new AsyncEnumerable<TOut>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public Concat(second: Accelatrix_Enumerable.Collections.IEnumerable<T>)
                {
                    return !IsPromise(second)
                           ? super.Concat(second as any)
                           : new AsyncEnumerable([ 
                                                    this,
                                                    new AsyncEnumerable([1]).Select(z => second).SelectMany(z => z)
                                                 ]).SelectMany(z => z);
                }

                @EnumerableSerialization.DataMember()
                public ToEnumerable<T>()
                {
                    return super.ToEnumerable() as any;
                }

                public FirstOrNull()
                {
                    var myResolver: (result: T) => void;
                    var myRejector: (exception: Accelatrix_Base.Exception) => void = ex => { console.error(ex); };
                    var finalizer: () => void;
                    var canceller = () =>
                    {
                        if (myRejector != null)
                            myRejector(new Accelatrix_Base.AbortException());
                        myResolver = myRejector = finalizer = canceller = () => { };
                    };

                    var result: T = undefined as any;

                    var myPromise = {} as Accelatrix_Async.Async.IChainablePromise<T>;

                    var isDoing = false;

                    var doer = () =>
                    {
                        if (isDoing) return;

                        isDoing = true;

                        var handler = this.ForEach(z =>
                        {
                            result = z;
                            return false; // stop cycle
                        });
        
                        canceller = handler.Cancel;
    
                        handler.Finally((exception?: Accelatrix_Base.Exception) =>
                        {
                            try
                            {
                                if (exception != null)
                                {
                                    if (myRejector != null)
                                        myRejector(exception);
                                }
                                else
                                {
                                    if (myResolver != null)
                                        myResolver(result);
                                }
                            }
                            catch(ex)
                            {
                                if (myRejector != null)
                                    myRejector(ex as any);
                            }
                            finally
                            {
                                canceller = myRejector = myResolver = () => { };
    
                                if (finalizer != null)
                                    finalizer();
    
                                finalizer = () => { };
                            }
                        });                        
                    };

                    Object.defineProperty(myPromise, "then", { value: (onFullfilled: (result: T) => void) =>
                    {
                        myResolver = onFullfilled;
                        doer();
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Then", { value: (onFullfilled: (result: T) => void) =>
                    {
                        return myPromise.then(onFullfilled);
                    }});

                    Object.defineProperty(myPromise, "catch", { value: (onrejected: (exception:Accelatrix_Base.Exception) => void) =>
                    {
                        myRejector = onrejected;
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Catch", { value: (onrejected: (exception:Accelatrix_Base.Exception) => void) =>
                    {
                        return myPromise.catch(onrejected);
                    }});

                    Object.defineProperty(myPromise, "Finally", { value: (onFinished: () => void) =>
                    {
                        finalizer = onFinished;
                        return myPromise;
                    }});

                    Object.defineProperty(myPromise, "Cancel", { value: () =>
                    {
                        if (canceller != null)
                            canceller();
                    }});

                    Object.defineProperty(myPromise, "ContinueWith", { value: (continueWith: (result: any) => any, merge?: boolean) =>
                    { 
                        return Accelatrix_Async.Async.Chain(myPromise, continueWith as any, merge);
                    }});                    

                    return myPromise as any;
                }

                public LastOrNull()
                {
                    return Accelatrix_Async.Async.Chain(this.ToList(), (r: Array<T>) => r == null ? null : r[r.length - 1]) as any;
                }

                @EnumerableSerialization.DataMember()
                public Reverse()
                {
                    return Accelatrix_Async.Async.Chain(this.ToList(), (r: Array<T>) => r == null ? null : r.Reverse()) as any;
                }

                @EnumerableSerialization.DataMember()
                public NotNullOrEmpty()
                {
                    return super.NotNullOrEmpty();    
                }

                public Contains(element: T | PromiseLike<T>)
                {
                    var me = this;
        
                    if (IsPromise(element))
                    {
                        var containsPromise = Accelatrix_Async.Async.Chain(element,
                                                                           r => me.Contains(r),
                                                                           true);
                        return containsPromise;
                    }

                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
                        var hasFound = false;
                        
                        while (!hasFound && myEnumerator.MoveNext())
                        {                            
                            if (!IsPromise(myEnumerator.Current))
                            {
                                if (Object.AreEqual(myEnumerator.Current, element))
                                {
                                    hasFound = true;
                                    yield true;
                                }                                    
                            }
                            else
                                yield Accelatrix_Async.Async.Chain(myEnumerator.Current,
                                                                   r =>
                                                                   {
                                                                        if (r === undefined || hasFound)
                                                                            return undefined;

                                                                        hasFound = Object.AreEqual(r, element);

                                                                        return !hasFound
                                                                                ? undefined
                                                                                : true
                                                                   });
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return (new (this as any).constructor(combinedIterator) as AsyncEnumerable<T>).Any(); // AsyncEnumerable or ParallelQuery     
                }

                public NotContains(element: T | PromiseLike<T>)
                {
                    var me = this;
        
                    if (IsPromise(element))
                    {
                        var containsPromise = Accelatrix_Async.Async.Chain(element,
                                                                           r => me.NotContains(r),
                                                                           true);
                        return containsPromise;
                    }

                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
                        var hasFound = false;
                        
                        while (!hasFound && myEnumerator.MoveNext())
                        {                            
                            if (!IsPromise(myEnumerator.Current))
                            {
                                if (Object.AreEqual(myEnumerator.Current, element))
                                {
                                    hasFound = true;
                                    yield false;
                                }                                    
                            }
                            else
                                yield Accelatrix_Async.Async.Chain(myEnumerator.Current,
                                                                    r =>
                                                                    {
                                                                        if (r === undefined || hasFound)
                                                                            return undefined;

                                                                        hasFound = Object.AreEqual(r, element);

                                                                        return !hasFound
                                                                               ? undefined
                                                                               : false
                                                                    });
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return (new (this as any).constructor(combinedIterator) as AsyncEnumerable<T>).NotAny(); // AsyncEnumerable or ParallelQuery     
                }                

                @EnumerableSerialization.DataMember()
                public OrderBy<TKey>(comparer?: (a: T, b: T) => number | any)
                {
                    return Accelatrix_Async.Async.Chain(this.ToList(), (r: Array<T>) => r == null ? null : r.OrderBy(comparer)) as any;                
                }

                @EnumerableSerialization.DataMember()
                public OrderByDescending<TKey>(comparer?: (a: T, b: T) => number | any)
                {
                    return Accelatrix_Async.Async.Chain(this.ToList(), (r: Array<T>) => r == null ? null : r.OrderByDescending(comparer)) as any;                
                }

                @EnumerableSerialization.DataMember()
                public Distinct(equalityComparer?: (a: T, b: T) => boolean)
                {
                    var me = this;
                    var popped: Array<T> = [];
                    var comparer = equalityComparer != null
                                   ? equalityComparer
                                   : (a, b) => Object.AreEqual(a, b);
            
                    var selector = (element: T) =>
                    {
                        if (popped.length == 0) return false;
            
                        for (var i = 0; i < popped.length; i++)
                        {
                            if (popped[i] == element) return true;
                            if (popped[i] != null && comparer(popped[i], element)) return true;
                        }
            
                        return false;
                    }
            
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                if (!selector(myEnumerator.Current))
                                {
                                    popped.push(myEnumerator.Current);
                                    yield myEnumerator.Current;
                                }
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                             r =>
                                                                             {
                                                                                if (r === undefined)
                                                                                    return r;

                                                                                if (!selector(r))
                                                                                {
                                                                                    popped.push(r);
                                                                                    return r;
                                                                                }
                                                                                
                                                                                return undefined;
                                                                             });

                                yield myPromise;
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public TakeWhileDistinct()
                {
                    var me = this;
            
                    var popped: Array<T> = [];
            
                    var selector = (element: T) =>
                    {
                        if (popped.length == 0) return false;
            
                        for (var i = 0; i < popped.length; i++)
                        {
                            if (Object.AreEqual(popped[i], element))
                                return true;
                        }
            
                        return false;
                    }
            
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
                        var stop = false;

                        while (!stop && myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                if (!selector(myEnumerator.Current))
                                {
                                    popped.push(myEnumerator.Current);
                                    yield myEnumerator.Current;
                                }
                                else
                                    stop = true;
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current as any as PromiseLike<T>;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                    r =>
                                                                                    {
                                                                                        if (r === undefined || stop)
                                                                                            return undefined;

                                                                                        if (!selector(r))
                                                                                        {
                                                                                            popped.push(r);
                                                                                            return r;
                                                                                        }
                                                                                        else
                                                                                            stop = true;
                                                                                        
                                                                                        return undefined;
                                                                                    });

                                yield myPromise;                            
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public SkipWhileDistinct()
                {
                    var me = this;
            
                    var popped: Array<T> = [];
            
                    var selector = (element: T) =>
                    {
                        if (popped.length == 0) return false;
            
                        for (var i = 0; i < popped.length; i++)
                        {
                            if (Object.AreEqual(popped[i], element))
                                return true;
                        }
            
                        return false;
                    }
            
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var stopSkipping = false;
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                if (!selector(myEnumerator.Current))
                                {
                                    if (!stopSkipping) popped.push(myEnumerator.Current);
                                }
                                else
                                {
                                    stopSkipping = true;
                                    popped = null;
                                }

                                if (stopSkipping) yield myEnumerator.Current;
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current as any as PromiseLike<T>;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                    r =>
                                                                                    {
                                                                                        if (r === undefined || !stopSkipping)
                                                                                            return undefined;

                                                                                        if (!selector(r))
                                                                                        {
                                                                                            if (!stopSkipping) popped.push(r);
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            stopSkipping = true;
                                                                                            popped = null;
                                                                                        }
                                                            
                                                                                        if (stopSkipping) return r;
                                                                                        
                                                                                        return undefined;
                                                                                    });

                                yield myPromise;
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public Skip(count: number)
                {
                    var me = this;
            
                    var iterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var index = 0;
                        var stopSkipping = false;
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                stopSkipping = index++ > count - 1;

                                if (stopSkipping)
                                    yield myEnumerator.Current;
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current as any as PromiseLike<T>;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                    r =>
                                                                                    {
                                                                                        if (r === undefined)
                                                                                            return undefined;

                                                                                        stopSkipping = index++ > count - 1;
                                                                                        
                                                                                        return stopSkipping ? r : undefined;
                                                                                    });

                                yield myPromise;
                            }
                        }                        
                    }  as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(iterator);
                    return new (this as any).constructor(iterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public Take(count: number)
                {
                    var me = this;
            
                    var iterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var index = 0;
                        var take = true;
            
                        while (take && myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                take = index++ < count - 1;
                                yield myEnumerator.Current;
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                             r =>
                                                                             {
                                                                                if (r === undefined || !take)
                                                                                    return undefined;

                                                                                take = index++ < count - 1;
                                                                                
                                                                                return r;
                                                                             });

                                yield myPromise;
                            }
                        }                        
                    }  as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(iterator);
                    return new (this as any).constructor(iterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public SkipWhile(condition: (member: T) => boolean)
                {
                    var me = this;
            
                    var iterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var endedSkipping = false;
            
                        while (myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                endedSkipping = endedSkipping || condition == null || !condition(myEnumerator.Current);
                                if (endedSkipping) yield myEnumerator.Current;
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current as any as PromiseLike<T>;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                    r =>
                                                                                    {
                                                                                        if (r === undefined || stop)
                                                                                            return undefined;

                                                                                        endedSkipping = endedSkipping || condition == null || !condition(r);
                                                                                        
                                                                                        return endedSkipping ? r : undefined;
                                                                                    });

                                yield myPromise;                                
                            }           
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(iterator);
                    return new (this as any).constructor(iterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public TakeWhile(condition: (item: T) => boolean)
                {
                    var me = this;
            
                    var iterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
            
                        var taking = true;
            
                        while (taking && myEnumerator.MoveNext())
                        {
                            if (!IsPromise(myEnumerator.Current))
                            {
                                taking = (taking || condition == null) && condition(myEnumerator.Current);
            
                                if (taking) yield myEnumerator.Current;
                            }
                            else
                            {
                                var currentPromise = myEnumerator.Current as any as PromiseLike<T>;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                    r =>
                                                                                    {
                                                                                        if (r === undefined || stop)
                                                                                            return undefined;

                                                                                        taking = (taking || condition == null) && condition(r);
                                                                                        
                                                                                        return taking ? r : undefined;
                                                                                    });

                                yield myPromise;                                 
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(iterator);
                    return new (this as any).constructor(iterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public Union(sequence: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>)
                {
                    var second = sequence == null
                                 ? null
                                 : new (this as any).constructor(sequence) as AsyncEnumerable<T>;

                    return second == null
                           ? this
                           : this.Concat(second.Where(z => Accelatrix_Async.Async.Chain(this.Contains(z), z => z === undefined ? z : !z)));
                }

                @EnumerableSerialization.DataMember()
                public GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn)
                {
                    var me = this;
                    var popped : { Key: TIn, Values: T[] }[] = [];
    
                    var combinedIterator = function* ()
                    {
                        var poppedGroupCount = 0;
                        let myEnumerator = me.GetEnumerator();
                        
                        var lineIterator = function*()
                        {
                            var i = 0;
                            while (myEnumerator.MoveNext())
                            {
                                if (!IsPromise(myEnumerator.Current))
                                {
                                    let transformed = keySelector(myEnumerator.Current, i++);
                                    let poppedEntry = popped.Where(z => Object.AreEqual(z.Key, transformed)).FirstOrNull();
                                    let newKey = poppedEntry == null;
        
                                    if (newKey)
                                    {
                                        poppedEntry = { Key: transformed, Values: [] };
                                        popped.push(poppedEntry);
                                    }
                                    
                                    poppedEntry.Values.push(myEnumerator.Current);
        
                                    yield poppedEntry;
                                }
                                else
                                {
                                    var currentPromise = myEnumerator.Current;
                                    var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                 r =>
                                                                                 {
                                                                                    if (r === undefined) return undefined;

                                                                                    let transformed = keySelector(r, i++);
                                                                                    let poppedEntry = popped.Where(z => Object.AreEqual(z.Key, transformed)).FirstOrNull();
                                                                                    let newKey = poppedEntry == null;

                                                                                    if (newKey)
                                                                                    {
                                                                                        poppedEntry = { Key: transformed, Values: [] };
                                                                                        popped.push(poppedEntry);
                                                                                    }
                                                                                    
                                                                                    poppedEntry.Values.push(r);

                                                                                    return newKey
                                                                                           ? poppedEntry
                                                                                           : { 
                                                                                                Key: poppedEntry.Key,
                                                                                                Values: [r],
                                                                                                IsCumulative: true
                                                                                              } // pass new member to values
                                                                                 });
                                    yield myPromise;
                                }
                            }
    
                        } as () => IterableIterator<{ Key: TIn, Values: T[] }>;
    
                        var lineEnumerator = (new (me as any).constructor(lineIterator) as AsyncEnumerable<{ Key: TIn, Values: T[] }>).GetEnumerator(); //new AsyncEnumerable(lineIterator).GetEnumerator();
    
                        var groupIterator = function*()
                        {
                            while (lineEnumerator.MoveNext())
                            {
                                if (!IsPromise(lineEnumerator.Current))
                                {
                                    while (poppedGroupCount < popped.length)
                                    {                                    
                                        poppedGroupCount++;
                                        yield popped[poppedGroupCount - 1];
                                    }
                                }
                                else
                                    yield lineEnumerator.Current;
                            }
    
                        } as () => IterableIterator<{ Key: TIn, Values: T[] }>;
    
                        var groupsEnumerator = (new (me as any).constructor(groupIterator) as AsyncEnumerable<{ Key: TIn, Values: T[] }>).GetEnumerator(); //new AsyncEnumerable(groupIterator).GetEnumerator();
    
                        while (groupsEnumerator.MoveNext())
                        {
                            if (!IsPromise(groupsEnumerator.Current))
                            {
                                let currentKey = groupsEnumerator.Current.Key;
                                let loadedValues = groupsEnumerator.Current.Values;
        
                                var valuesIterator = function*()
                                {                        
                                    var nextIndex = 0;
        
                                    // already calculated
                                    while (nextIndex < loadedValues.length)
                                        yield loadedValues[nextIndex++];
        
                                    // future
                                    while (lineEnumerator.MoveNext())
                                    {
                                        if (!IsPromise(lineEnumerator.Current))
                                        {
                                            while (nextIndex < loadedValues.length)
                                                yield loadedValues[nextIndex++];    
                                        }
                                        else
                                        {
                                            var currentPromise = lineEnumerator.Current;
                                            var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                         rslt =>
                                                                                         {
                                                                                            if (rslt === undefined) return undefined;
                                                                                            
                                                                                            return rslt != null && Object.AreEqual(rslt.Key, currentKey)
                                                                                                   ? rslt.Values.FirstOrNull() // as it is singular
                                                                                                   : undefined; // not my group
                                                                                         });                                                                                        
                                            yield myPromise;                                                                                           
                                        }
                                    }
        
                                } as () => IterableIterator<T>;
        
                                var values = new (me as any).constructor(valuesIterator) as AsyncEnumerable<T>; //new AsyncEnumerable(valuesIterator);
                                Object.defineProperty(values, "Key", { get: () => currentKey, enumerable: true });

                                yield values as any as Accelatrix_Enumerable.Collections.IGrouping<TIn, T>;
                            }
                            else  // is promise
                            {
                                var currentPromise = groupsEnumerator.Current;
                                var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                             r =>
                                                                             {
                                                                                if (r === undefined) return r;

                                                                                let currentKey = r.Key;
                                                                                let loadedValues = r.Values;

                                                                                //find if group has been yielded
                                                                                if (r["IsCumulative"]) return undefined; // group has been returned and this is a set of folow-up values pertaining to that group

                                                                                poppedGroupCount++;

                                                                                var valuesIterator = function*()
                                                                                {                        
                                                                                    var nextIndex = 0;

                                                                                    // already calculated
                                                                                    while (nextIndex < loadedValues.length)
                                                                                        yield loadedValues[nextIndex++];

                                                                                    // future
                                                                                    while (lineEnumerator.MoveNext())
                                                                                    {
                                                                                        if (!IsPromise(lineEnumerator.Current))
                                                                                        {
                                                                                            while (nextIndex < loadedValues.length)
                                                                                                yield loadedValues[nextIndex++];    
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            var currentPromise = lineEnumerator.Current;
                                                                                            var myPromise = Accelatrix_Async.Async.Chain(currentPromise,
                                                                                                                                         rslt =>
                                                                                                                                         {
                                                                                                                                            if (rslt === undefined) return undefined;
                                                                                                                                            
                                                                                                                                            return rslt != null && Object.AreEqual(rslt.Key, currentKey)
                                                                                                                                                   ? rslt.Values.FirstOrNull() // as it is singular
                                                                                                                                                   : undefined; // not my group
                                                                                                                                         });                                                                                        
                                                                                            yield myPromise;                                                                                                    
                                                                                        }
                                                                                    }

                                                                                } as () => IterableIterator<T>;

                                                                                var values = new (me as any).constructor(valuesIterator) as AsyncEnumerable<T>; //new AsyncEnumerable(valuesIterator);
                                                                                Object.defineProperty(values, "Key", { get: () => currentKey, enumerable: true });

                                                                                return values as any as Accelatrix_Enumerable.Collections.IGrouping<TIn, T>;
                                                                             });

                                yield myPromise;
                            }
                        }
                        
                    } as () => IterableIterator<Accelatrix_Enumerable.Collections.IGrouping<TIn, T>>
            
                    //return new AsyncEnumerable<IGrouping<TIn, T>>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }

                @EnumerableSerialization.DataMember()
                public Zip<Tsecond, TOut>(second: Accelatrix_Enumerable.Collections.IEnumerableOps<Tsecond> | IEnumerableAsyncOps<Tsecond>, resultSelector?: (element: T, second: Tsecond, index?: number) => TOut | PromiseLike<TOut>)
                {
                    var what = second == null
                               ? []
                               : second;

                    var outputProducer = resultSelector != null
                                         ? resultSelector
                                         : (element, second, index) => <any>{ Item1: element, Item2: second };

                    var me = this;
        
                    var combinedIterator = function* ()
                    {
                        var enumerator1 = me.GetEnumerator();
                        var enumerator2 = what.GetEnumerator();
            
                        var keepGoing = true;
                        var index = 0;

                        while (keepGoing)
                        {
                            var one = enumerator1.MoveNext();
                            var two = enumerator2.MoveNext();
                            keepGoing = one || two;

                            var ele1 = enumerator1.Current;
                            var ele2 = enumerator2.Current;

                            if (ele1 === undefined && ele2 === undefined)
                            {
                                keepGoing = false;
                                return;                                
                            }

                            if (!IsPromise(ele1) && !IsPromise(ele2))
                                yield outputProducer(ele1, ele2, index++);
                            else if (!IsPromise(ele1))
                            {
                                yield Accelatrix_Async.Async.Chain(ele2 as any as PromiseLike<T>,
                                                                          r =>
                                                                          { 
                                                                              if (r === undefined)
                                                                                return r;

                                                                              return outputProducer(ele1, r, index++);
                                                                          });
                            }
                            else if (!IsPromise(ele2))
                            {
                                yield Accelatrix_Async.Async.Chain(ele1 as any as PromiseLike<T>,
                                                                          r =>
                                                                          { 
                                                                              if (r === undefined)
                                                                                return r;

                                                                              return outputProducer(r, ele2, index++);
                                                                          });
                            }
                            else // two promises
                            {
                                yield Accelatrix_Async.Async.Chain(ele1 as any as PromiseLike<T>,
                                                                          r =>
                                                                          { 
                                                                              return Accelatrix_Async.Async.Chain(ele2 as any as PromiseLike<Tsecond>,
                                                                                                                         r2 =>
                                                                                                                         {
                                                                                                                             if (r === undefined && r2 === undefined)
                                                                                                                             {
                                                                                                                                keepGoing = false;
                                                                                                                                return undefined;
                                                                                                                             }

                                                                                                                             return outputProducer(r, r2, index++);
                                                                                                                         })
                                                                          },
                                                                          true);
                            }
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery   
                }
                
                @EnumerableSerialization.DataMember()
                public Interleave(second: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>)
                {
                    if (second == null) return this;
            
                    return this.Zip(second, (a, b) => [a, b]).SelectMany(z => z);
                }

                @EnumerableSerialization.DataMember()
                public Intersect(sequence: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>)
                {
                    var me = this;
            
                    var what = sequence;
            
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
                        var secondEnumerator = what.GetEnumerator();
                        var reachedEnd = false;
                        var popped: Array<T> = [];
            
                        var pullNextEnum2 = (enum1: T) =>
                        {
                            if (!secondEnumerator.MoveNext())
                            {
                                reachedEnd = true;
                                return undefined;
                            }

                            if (!IsPromise(secondEnumerator.Current))
                            {
                                if (secondEnumerator.Current === undefined)
                                    return undefined;

                                popped.unshift(secondEnumerator.Current);

                                return Object.AreEqual(enum1, secondEnumerator.Current)
                                       ? enum1
                                       : pullNextEnum2(enum1);
                            }
                            else // is Promise                            
                                return Accelatrix_Async.Async.Chain(secondEnumerator.Current as any as PromiseLike<T>,
                                                                           enum2 =>
                                                                           {
                                                                                if (enum2 === undefined) return undefined;

                                                                                popped.unshift(enum2);

                                                                                if (Object.AreEqual(enum1, enum2))
                                                                                    return enum1;

                                                                                return pullNextEnum2(enum1);
                                                                           },
                                                                           true);
                        }

                        while (myEnumerator.MoveNext())
                        {
                            yield Accelatrix_Async.Async.Chain(myEnumerator.Current as any as PromiseLike<T>,
                                                                      enum1 =>
                                                                      {
                                                                            if (enum1 === undefined) return undefined;

                                                                            if (popped.Contains(enum1)) return enum1 as any;

                                                                            if (reachedEnd) return undefined;

                                                                            return pullNextEnum2(enum1) as any;
                                                                      },
                                                                      true);
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }
    
                @EnumerableSerialization.DataMember()
                public Except(sequence: Accelatrix_Enumerable.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>)
                {
                    var me = this;
            
                    var what = sequence;
            
                    var combinedIterator = function* ()
                    {
                        var myEnumerator = me.GetEnumerator();
                        var secondEnumerator = what.GetEnumerator();
                        var reachedEnd = false;
                        var popped: Array<T> = [];
            
                        var pullNextEnum2 = (enum1: T) =>
                        {
                            if (!secondEnumerator.MoveNext())
                            {
                                reachedEnd = true;
                                return enum1;
                            }

                            if (!IsPromise(secondEnumerator.Current))
                            {
                                if (secondEnumerator.Current === undefined)
                                    return enum1;

                                popped.unshift(secondEnumerator.Current);

                                return Object.AreEqual(enum1, secondEnumerator.Current)
                                       ? undefined
                                       : pullNextEnum2(enum1);
                            }
                            else // is Promise                            
                                return Accelatrix_Async.Async.Chain(secondEnumerator.Current as any as PromiseLike<T>,
                                                                           enum2 =>
                                                                           {
                                                                                if (enum2 === undefined) return enum1;

                                                                                popped.unshift(enum2);

                                                                                if (Object.AreEqual(enum1, enum2))
                                                                                    return undefined;

                                                                                return pullNextEnum2(enum1);
                                                                           },
                                                                           true);
                        }

                        while (myEnumerator.MoveNext())
                        {
                            yield Accelatrix_Async.Async.Chain(myEnumerator.Current as any as PromiseLike<T>,
                                                                      enum1 =>
                                                                      {
                                                                            if (enum1 === undefined) return undefined;

                                                                            if (popped.Contains(enum1)) return undefined;

                                                                            if (reachedEnd) return enum1;

                                                                            return pullNextEnum2(enum1) as any;
                                                                      },
                                                                      true);
                        }
                    } as () => IterableIterator<T>
            
                    //return new AsyncEnumerable<T>(combinedIterator);
                    return new (this as any).constructor(combinedIterator); // AsyncEnumerable or ParallelQuery
                }

                public ToDictionary(keySelector: (element: T, index?: number) => any, valueSelector: (element: T, index?: number) => any)
                {                                                                                   
                    return Accelatrix_Async.Async.Chain(this.ToList(),
                                                               (r: Accelatrix_Enumerable.Collections.IEnumerableOps<T>) => r.ToDictionary(keySelector, valueSelector)) as any;
                }

                public Sum(selector?: (element: T, index?: number) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>)
                {
                    return Accelatrix_Async.Async.Chain(this.Select(selector).ToList(),
                                                               (r: Accelatrix_Enumerable.Collections.IEnumerableOps<T>) => r.Sum()) as any;                    
                }

                public Average(selector?: (element: T, index?: number) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>)
                {
                    return Accelatrix_Async.Async.Chain(this.Select(selector).ToList(),
                                                               (r: Accelatrix_Enumerable.Collections.IEnumerableOps<T>) => r.Average()) as any;                      
                }                

                public Max(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>)
                {
                    return Accelatrix_Async.Async.Chain(this.ToList(),
                                                       (r: Accelatrix_Enumerable.Collections.IEnumerableOps<T>) => r.Max(comparer)) as any;  
                }                

                public Min(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>)
                {
                    return Accelatrix_Async.Async.Chain(this.ToList(),
                                                       (r: Accelatrix_Enumerable.Collections.IEnumerableOps<T>) => r.Min(comparer)) as any;  
                }
            }

            function IsPromise(value: any)
            {
                return Accelatrix_Async.Async.IsPromise(value);
            }

            /**
             * Redefine GetEnumerator() to automatically skip over "undefined" a
             * @param asyncEnumerable The async enumeration.
             */
            function RedefineGetEnumerator<T>(asyncEnumerable: AsyncEnumerable<T>)
            {
                var originalGetEnumerator = asyncEnumerable.GetEnumerator.bind(asyncEnumerable) as () => Accelatrix_Enumerable.Collections.IEnumerator<T>;

                Object.defineProperty(asyncEnumerable, "GetEnumerator", { value: () =>
                {
                    var myEnumerator = originalGetEnumerator();
                    
                    if (myEnumerator["$type"] == "AsyncEnumerator") return myEnumerator;

                    var originalMoveNext = myEnumerator.MoveNext.bind(myEnumerator);

                    Object.defineProperty(myEnumerator, "MoveNext", { value: () =>
                    {
                        var hasMoved = originalMoveNext();

                        return !hasMoved || !(myEnumerator.Current === undefined)
                               ? hasMoved
                               : myEnumerator.MoveNext();                   
                    }, configurable: false });

                    myEnumerator["$type"] = "AsyncEnumerator";

                    return myEnumerator;
                }});                
            }

            /** Any method that exists in the base type (Enumerable) and is not overriden in the AsyncEnumerable, should be wrapped as a Promise for forward-compatibiloty */
            function WrapInheritedMethods()
            {
                Object.getOwnPropertyNames(Accelatrix_Enumerable.Collections.Enumerable.prototype)
                      .Where(z => z != "toJSON" && z != "GetEnumerator"  && z != "constructor")
                      .Except(Object.getOwnPropertyNames(AsyncEnumerable.prototype))
                      .ForEach(z =>
                      {
                        Object.defineProperty(AsyncEnumerable.prototype, z,
                        {
                            value: function(...args: any[])
                            {
                                // new async enumeration with one member being the ToList of the previous and then apply the Enumerable method
                                var currentPromise = this.ToList();
                                var asyncEnum = new AsyncEnumerable( [ currentPromise ] ).Select(r => r === undefined ? undefined : (r[z == "ToArray" && r instanceof Array  ? "ToList" : z] as Function).apply(r, args) ).SelectMany(r => r);

                                // set the toJSON as the continuation
                                let parentOJson = this["toJSON"].bind(this);

                                asyncEnum["toJSON"] = function()
                                {
                                    let parent = parentOJson();
                                    parent["Members"].push({ Op: z, Args: args });
                                    return parent;                                    
                                };

                                return asyncEnum;
                            }
                        });
                      });
            }

            WrapInheritedMethods();
        }

        /** An enumeration that can cope with async members. */
        export const AsyncEnumerable: { new<T> (arg: Accelatrix_Enumerable.Collections.IEnumerableOps<T | PromiseLike<T>> | IEnumerableAsyncOps<T> | (() => IterableIterator<T | Promise<T>>)) : IEnumerableAsyncOps<T> & Accelatrix_Enumerable.Collections.Enumerable<T> } = AsyncEnumerableSystem.AsyncEnumerable as any;  

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(AsyncEnumerable.prototype.constructor, "name", { get: () => "AsyncEnumerable" });
    }
}