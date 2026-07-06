/// <reference path="./Base.ts" />
/// <reference path="./Type.ts" />
/// <reference path="./Number.ts" />

import { Accelatrix as Accelatrix_Base } from "./Base";
import { Accelatrix as Accelatrix_Number } from "./Number";
import { Accelatrix as Accelatrix_Type } from "./Type";
import { Accelatrix as Accelatrix_Collections } from "./Collections";
import { Accelatrix as Accelatrix_Async } from "./Async";
import { Accelatrix as Accelatrix_AsyncEnumerable } from "./AsyncEnumerable";

declare global
{
    /** Array as IEnumerable. */
    export interface Array<T> extends Accelatrix.Collections.IEnumerableOps<T>
    {

    }

    export interface ObjectConstructor extends Object
    {
        /**
        * Flattens a hierarchy contained within an object into a single sequence, e.g. myHierarchy.FlattenHierarchy(z => z.Children).
        * @param obj The root object to flatten.
        * @param childEnumerator The predicate that given one element retrieves the list of children.
        */
        FlattenHierarchy<T>(obj: Object, childEnumerator: (item: T) => Accelatrix.Collections.IEnumerableOps<T>): Accelatrix.Collections.IEnumerableOps<T>;
    }    
}

/** Accelatrix namespace. */
export namespace Accelatrix
{
    export namespace Collections
    {
        /** Supports a simple iteration over an enumeration of a specified type. */
        export interface IEnumerator<T>
        {
            /** Gets the element in the enumeration at the current position. */
            readonly Current: T;

            /** Advances the enumerator to the next element of the enumeration and indicates if the operation was successful. */
            MoveNext: () => boolean;

            /** Sets the enumerator to its initial position, which is before the first element. */
            Reset: () => void;
        }

        /**
        * A generic typed enumeration.
        */
        export interface IEnumerable<T>
        {
            /** Gets the enumerator to iterate through the enumeration. */
            GetEnumerator(): IEnumerator<T>;
        }

        /** A grouped enumeration.  */
        export interface IGrouping<TKey, T> extends IEnumerableOps<T>
        {
            Key: TKey;
        }

        /** Enumerable operations in enumerations. */
        export interface IEnumerableOps<T> extends IEnumerable<T>
        {
            /**
             * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
             * @param typeConstructor The type constructor, e.g. the reference to the class definition.
             */
            OfType<TFilter>(typeConstructor: { new (...args: any[]): TFilter }): IEnumerableOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param type The Accelatrix.Type of the type to filter.
             */
            OfType<TFilter>(type: Accelatrix_Type.Type): IEnumerableOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param typeName The name or full name of the type.
             */
            OfType<TFilter>(typeName: string): IEnumerableOps<TFilter>;

            /** Gets if the sequence contains any elements. */
            Any(): boolean;

            /** Gets if the sequence doet not contain any elements. */
            NotAny(): boolean;            

            /** Freezes the current enumeration so that the position of the iterator is retained during subsquent calls. */
            Freeze(): IEnumerableOps<T>;

            /** Wraps the enumeration. */
            ToEnumerable(): IEnumerableOps<IEnumerableOps<T>>;

            /** Iterates through the enumeration to product a typed list. */
            ToList(): Array<T>;

            /** Commits an enumeration as a typed list and gives the count of memebers. */
            Count(): number;

            /**
             * Iterates through each element in the enumeration and executes an action. The loop can be halted if the action returns false.
             * @param action The action to execute. The cycle is halted if the action returns a boolean false.
             */
            ForEach(action: (element: T, index?: number) => boolean | void | any): void;

            /**
            * Concatenates one sequence after the existing.
            *
            * @param second The second enumeration.
            */
            Concat(second: IEnumerableOps<T>): IEnumerableOps<T>;

            /**
            * Projects each element of a sequence into a new form.
            * @param selector The projection function.
            */
            Select<TOut>(selector: (element: T, index?: number) => TOut): IEnumerableOps<TOut>;

            /**
            * Projects each element of a sequence into a sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children).
            * @param selector The projection function.
            */
            SelectMany<TOut>(selector: (element: T, index?: number) => IEnumerableOps<TOut>): IEnumerableOps<TOut>;

            /**
            * Filters a sequence of values based on a predicate.
            * @param selector The selector function.
            */
            Where(selector: (element: T, index?: number) => boolean): IEnumerableOps<T>;

            /** Gets the first element of a sequence, or null if empty. */
            FirstOrNull(): T | null;

            /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
            LastOrNull(): T | null;

            /** Produces a new enumeration in reverse order, which implies that the enumeration is finite. */
            Reverse(): Array<T>;

            /** Gets all entries which are not null, and in string enumerations, not empty or white spaces. */
            NotNullOrEmpty(): IEnumerableOps<T>;

            /** If a given element exists within the enumeration. */
            Contains(element: T): boolean;

            /** If a given element does not exist within the enumeration. */
            NotContains(element: T): boolean;            

            /**
            * Sorts the sequence is ascending order.
            * @param comparer The sorting criteria;
            */
            OrderBy(comparer?: (a: T, b: T) => number | any): Array<T>;

            /**
            * Sorts the sequence in descending order.
            * @param comparer The sorting criteria.
            */
            OrderByDescending(comparer?: (a: T, b: T) => number | any): Array<T>;

            /**
            * Get the distinct members, which relies on Equals().
            * @param equalityComparer An optional comparer.
            */
            Distinct(equalityComparer?: (a: T, b: T) => boolean): IEnumerableOps<T>;

            /** Takes elements of a sequence until a duplicate is found, which relies on Equals(). */
            TakeWhileDistinct(): IEnumerableOps<T>;

            /** Skips elements of a sequence until a duplicate is found, which relies on Equals(). */
            SkipWhileDistinct(): IEnumerableOps<T>;

            /**
            * Groups the items in a collection based, and produces a map/dictionary where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
            * @param keySelector The group by criterion.
            */        
            GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerableOps<IGrouping<TIn, T>>;

            /**
            * Groups the items in a collection based on a key and its sequence, and produces an enumeration where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
            * There may be groups with the same key depending on their order in the enumeration.
            * @param keySelector The group by criterion.
            */
            GroupByConsecutive<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerableOps<IGrouping<TIn, T>>;

            /**
            * Produces the intersection of two sequences.
            * @param sequence The sequence to intersect.
            */
            Intersect(sequence: IEnumerableOps<T>): IEnumerableOps<T>;

            /**
            * Produces the exclusion of elements from a sequence.
            * @param sequence The sequence to subtract.
            */
            Except(sequence: IEnumerableOps<T>): IEnumerableOps<T>;

            /**
            * Produces the set union of two sequences by using the default equality comparer.
            * Different from Concat since only distinct members of the second sequence will end up in the new enumeration.    
            * @param sequence The sequence to union.
            */
            Union(sequence: IEnumerableOps<T>): IEnumerableOps<T>;

            /**
            * Bypasses a specified number of contiguous elements from the start of the sequence.
            * @param count The number of elements to bypass.
            */
            Skip(count: number): IEnumerableOps<T>;

            /**
            * Returns a specified number of contiguous elements from the start of the sequence.
            * @param count The number of elements to take.
            */
            Take(count: number): IEnumerableOps<T>;

            /**
            * Skips the sequence while a condition is true.
            * @param condition The condition that while true will skip the member.
            */
            SkipWhile(condition: (member: T) => boolean): IEnumerableOps<T>;

            /**
            * Returns a specified number of contiguous elements from the start of the sequence.
            * @param condition The selector of elements to take.
            */
            TakeWhile(condition: (item: T) => boolean): IEnumerableOps<T>;

            /**
            * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
            * @param second The sequence to zip.
            * @param resultSelector The predicate that joins an element of T and another of Tsecond and creates a TOut.
            */
            Zip<TSecond, TOut>(second: IEnumerableOps<TSecond>, resultSelector?: (element: T, second: TSecond, index?: number) => TOut): IEnumerableOps<TOut>;

            /**
            * Interleaves two sequences - creates a single sequence from the elements of two sequences arranged in an alternate way.
            * @param second The second enumeration to interleave with.
            */
            Interleave(second: IEnumerableOps<T>): IEnumerableOps<T>;

            /**
            * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
            * @param keySelector A function to extract the key from each element.
            * @param valueSelector A function to extract the value from each element.
            */        
            ToDictionary<TKey, TOut extends IEnumerableOps<any>>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix_Collections.Collections.IHashMap<TKey, IEnumerableOps<TOut>>;

            /**
            * Sums all quantitative items in the collection.
            */
            Sum<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>>(): T;
            /**
            * Sums all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */            
            Sum<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>>(selector?: (element: T, index?: number) => TOut): TOut;            

            /**
            * Min of all quantitative items in the collection.
            */
            Average<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T;
            /**
            * Min of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Average<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(selector?: (element: T, index?: number) => TOut): TOut;

            /**
            * Min of all quantitative items in the collection.
            */
            Max<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T;
            /**
            * Min of all quantitative items in the collection.
            * @param selector An optional comparer.
            */
            Max(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): T;

            /**
            * Min of all quantitative items in the collection.
            */
            Min<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T;
            /**
            * Min of all quantitative items in the collection.
            * @param comparer An optional comparer.
            */
            Min(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): T;
        }

        
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

        class Enumerator<T> implements IEnumerator<T>
        {
            private iterator: IterableIterator<T> = undefined as any;

            constructor(generator: () => IterableIterator<T>)
            {
                this.GetIterator = generator;
                this.Reset();
            }

            public GetIterator: () => IterableIterator<T>;

            public Current: T = undefined as any;

            public MoveNext(): boolean
            {
                var result = this.iterator.next();

                this.Current = result.done
                                ? undefined as any
                                : result.value;

                return !result.done;
            }

            public Reset()
            {
                this.iterator = this.GetIterator();
            }
        }

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

        /** An enumeration. */
        export class Enumerable<T> implements IEnumerableOps<T>
        {
            /**
             * Extends the Enumerable<T> implementation and of its descendants.
             * @param func The new functional method, e.g. Accelatrix.Collections.Enumerable.AddFunctionalMethod(function ToIndexed(item, index) { return this.Select((z, i) => ({ Item: z, Index: i })) })
             */
            public static AddFunctionalMethod<T>(func: {name: string, (this: IEnumerableOps<T>, ...args): IEnumerableOps<T> })
            {
                if (func == null) throw new Accelatrix_Base.ArgumentNullException("func");
                if (!func.GetType().IsFunction) throw new Accelatrix_Base.ArgumentException("A named function needs to be passed to AddFunctionalMethod.");
                if (String.IsNullOrWhiteSpace(func.name)) throw new Accelatrix_Base.ArgumentException("A named function needs to be passed and the one you provided does not have a name.");

                Enumerable.prototype[func.name] = function(...args)
                { 
                    let result = func.bind(this).apply(this, args);

                    let parentOJson = this["toJSON"].bind(this);
                    result["toJSON"] = function()
                    {
                        let parent = parentOJson();

                        parent["Members"].push({ Op: func.name, Args: args });
                        return parent;                    
                    }

                    return result;
                };

                Array.prototype[func.name] = function (...args)
                {
                    let result = func.bind(this).apply(this, args);

                    return result;
                }                
            }

            /**
             * Creates a new Enumeration based on an existing enumeration.
             * @param enumerable An array, an enumeration, or a factory
             */
            public constructor(enumerable: Array<T> | IEnumerableOps<T> | (() => IterableIterator<T>))
            {            
                if (enumerable == null) throw new Accelatrix_Base.ArgumentNullException("enumerable");
                
                this.toJSON = function toJSON()
                              {
                                var myObj = { "$type": this.GetType().GetFullName(), "Members": [enumerable] };
                                if (this.Key != null)
                                    myObj["Key"] = this.Key;
                                return myObj;
                             };

                var getEnumeratorFactory: () => IEnumerator<T>;

                //handle array
                if (enumerable == null || enumerable instanceof Array)
                {
                    if (enumerable == null) enumerable = [];

                    // Count is dynamic as Array may have elements add
                    Object.defineProperty(this, "Count", { value: () => (<Array<T>>enumerable).length, enumerable: false, configurable: true });                    
                    
                    var arrIterator = function* ()
                    {                        
                        var nextIndex = 0;
                        while (nextIndex < (<Array<T>>enumerable).length)
                        {
                            yield enumerable[nextIndex++];
                        }
                    } as () => IterableIterator<T>
        
                    Object.defineProperty(this, "Any", { value: () => this.Count() > 0, enumerable: false, configurable: true });                    

                    getEnumeratorFactory = () => new Enumerator(arrIterator);
                }
                //handle IEnumerable
                else if (enumerable["GetEnumerator"] != null && (enumerable["GetEnumerator"] as IEnumerableOps<T>) instanceof Function)
                {
                    getEnumeratorFactory = () => (<IEnumerableOps<T>>enumerable).GetEnumerator();

                    //if (Object.getOwnPropertyDescriptor(enumerable, "Count") != null)
                    //    Object.defineProperty(this, "Count", { value: () => (enumerable as Enumerable<T>).Count(), enumerable: false, configurable: false });
                }
                else if (enumerable instanceof Function || enumerable.GetType().Name == "GeneratorFunction")
                {
                    var generator = <() => IterableIterator<T>>enumerable;
                    getEnumeratorFactory = () => new Enumerator(generator);
                }
                else //catch all, random object (unmanaged)
                {
                    var objIterator = function* ()
                    {
                        yield enumerable as any;
                    } as () => IterableIterator<T>
        
                    getEnumeratorFactory = () => new Enumerator(objIterator);
                }

                Object.defineProperty(this, "GetEnumerator", { get: () => getEnumeratorFactory, enumerable: false, configurable: true });
            }    

            /** Gets the enumerator to iterate through the enumeration. */
            public GetEnumerator(): IEnumerator<T>
            {
                return null as any;
                //return this.getEnumeratorFactory();
            }
        
            /** Freezes the current enumeration so that the position of the iterator is retained during subsquent calls. */
            public Freeze(): IEnumerableOps<T>
            {
                Object.defineProperty(this, "Freeze", { value: () => this, enumerable: false, configurable: true });

                var myEnumerator = this.GetEnumerator()
                
                var hasPeekedResult = false;
                var peekedResult: T = undefined as any;
                
                var newIterator = function* ()
                {
                    if (hasPeekedResult)
                    {
                        hasPeekedResult = false;
                        yield peekedResult;
                    }

                    while (myEnumerator.MoveNext())
                        yield myEnumerator.Current;

                } as () => IterableIterator<T>

                var getEnumeratorFactory = () => new Enumerator(newIterator);

                Object.defineProperty(this, "GetEnumerator", { get: () => getEnumeratorFactory, enumerable: false, configurable: true });
        

                // ------------- Any() implementation ------------------------
                var any = function Any()
                {                
                    let enumerator = this.GetEnumerator();
                    let result = enumerator.MoveNext();
                    if (result)
                    {
                        hasPeekedResult = true;
                        peekedResult = enumerator.Current;
                    }

                    return result;
                }

                any.bind(this);
                
                // ---------------------------------------------------------
                Object.defineProperty(this, "Any", { value: any, enumerable: false, configurable: true });
                
                return this as any;
            }

            /**  Gets if the sequence contains any elements. */        
            public Any(): boolean
            {
                return this.GetEnumerator().MoveNext();           
            }

            /**  Gets if the sequence does not contain any elements. */        
            public NotAny(): boolean
            {
                return !this.Any();           
            }            
        
            /** Commits the enumeration and gets its count. */
            private get length(): number
            {
                return this.ToArray();
            }

            /** Gets the first element, or null, if not present. */
            private get 0(): T
            {
                return this.FirstOrNull();
            }
        
            /** Commits the enumeration and gets the second element, or null, if not present. */
            private get 1(): T
            {
                this.ToArray();
                return this.Skip(1).FirstOrNull();
            }
        
            /** Convertion to JSON. */
            public toJSON()
            {
                var myObj = { "$type": this.GetType().GetFullName(), "Members": [] };
                //return  Accelatrix_Serialization.Serialization.ToJSON(myObj);
                return myObj;
            }

            /** Runs through the enumeration to produce a typed list. */
            public ToList(): Array<T>
            {
                var myEnumerator = this.GetEnumerator();

                var result: Array<T> = [];
        
                while (myEnumerator.MoveNext())
                    result.push(myEnumerator.Current);
        
                if (this["Key"] != null)
                {
                    var key = this["Key"];
                    Object.defineProperty(result, "Key", { get: () => key, enumerable: true });
                }

                return result;
            }
        

            /** Commits the enumeration and gets its length. */
            public Count(): number
            {   
                return this.ToArray();
            }

            /** Commits the enumeration as an array. */
            private ToArray()
            {
                let list = this.ToList();
                var newCommittedEnumeration = new Enumerable(list);

                var count = (list as Array<T>).length;
        
                for (var i = 0; i < count; i++)
                {
                    if (i == 0)
                        Object.defineProperty(this, 0, { get: () => list[0], enumerable: true, configurable: false });
                    else if (i == 1)
                        Object.defineProperty(this, 1, { get: () => list[1], enumerable: true, configurable: false });
                    else
                        this[i] = list[i];
                }                
        
                Object.defineProperty(this, "Count", { value: () => count, enumerable: false, configurable: false });
                Object.defineProperty(this, "GetEnumerator", { get: () => newCommittedEnumeration.GetEnumerator, enumerable: false, configurable: false });
                Object.defineProperty(this, "ToArray", { value: () => count, enumerable: false, configurable: false });

                return count;
            }

            /**
             * Iterates through each element in the enumeration and executes an action. The loop can be halted if the action returns false.
             * @param action The action to execute. The cycle is halted if the action returns a boolean false.
             */        
            public ForEach(action: (element: T, index?: number) => boolean | void | any): void
            {
                var myEnumerator = this.GetEnumerator();
        
                var index = 0;
                var proceed = true;
        
                while (proceed && myEnumerator.MoveNext())
                {
                    var result = action == null
                                ? true
                                : action(myEnumerator.Current, index++);
        
                    proceed = result == null || !(result === false);
                }
            }
        
            /**
             * Iterates through each element in the enumeration and executes an action in a separate task.
             * @param action The action to execute.
             */
            public ForAll<TOut>(action: (element: T, index?: number) => TOut): Accelatrix_Async.Async.IChainablePromise<TOut[]>
            {
                var promises = this.Select((z, i) => Accelatrix_Async.Async.AsPromise(action(z, i))).ToList();
                return Accelatrix_Async.Async.CombineAll(promises);
            }

            /**
            * Creates a new enumeration that is handled in Web Workers. 
            * The Tasks.Config.Scripts static property must have been set once in the session to present the baseline JS scripts/code segments to be used by tasks. Ensure that the scripts or code pertaining to Base.js, Object.js, Linq.js and Tasks.js are always included.
            */
            public AsParallel<T>() : Accelatrix_AsyncEnumerable.Collections.IEnumerableAsyncOps<T>
            {
                // injected latter. this is here to satisfy the .d.ts only
                return this as any;
            }

            /**
             * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
             * @param typeConstructorOrType The type constructor, e.g. the reference to the class, or the Accelatrix.Type of the type to filter.
             */
            @EnumerableSerialization.DataMember(true)
            public OfType<TFilter>(typeConstructorOrType: { new (...args: any[]): TFilter } | Accelatrix_Type.Type | string): IEnumerableOps<TFilter>
            {
                return this.Where(z => z != null && z.GetType().IsOfType(typeConstructorOrType))
                           .Select(z => z as any);
            }

            /** Wraps the enumeration. */
            @EnumerableSerialization.DataMember()
            public ToEnumerable<T>(): IEnumerableOps<T>
            {
                let result = new (this as any).constructor([this]); // Enumerable or ParallelQuery

                return result;
            }            
        
            /**
            * Projects each element of a sequence into a new form.
            *
            * @param selector The projection function.
            */
            @EnumerableSerialization.DataMember()
            public Select<TOut>(selector: (element: T, index?: number) => TOut): IEnumerableOps<TOut>
            {
                var me = this;
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();

                    var index = 0;
        
                    while (myEnumerator.MoveNext())
                        yield selector == null
                              ? <any>myEnumerator.Current
                             : selector(myEnumerator.Current, index++);

                } as () => IterableIterator<TOut>;
        
                //let result = new Enumerable<TOut>(combinedIterator);
                let result = new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery

                return result;
            }

            /**
            * Concatenates one sequence after the existing.
            *
            * @param second The second enumeration.
            */
            @EnumerableSerialization.DataMember()
            public Concat(second: IEnumerableOps<T>): IEnumerableOps<T>
            {
                if (second == null) return this as any;
                
                var me = this;
        
                var secondEnumerator = second.GetEnumerator();
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    while (myEnumerator.MoveNext())
                        yield myEnumerator.Current;
        
                    while (secondEnumerator.MoveNext())
                        yield secondEnumerator.Current;

                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /**
            * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children)
            *
            * @param selector The projection function.
            */
            @EnumerableSerialization.DataMember()
            public SelectMany<TOut>(selector: (element: T, index?: number) => IEnumerableOps<TOut>): IEnumerableOps<TOut>
            {
                var me = this;
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    var index = 0;
        
                    while (myEnumerator.MoveNext())
                    {
                        /*
                        var children = selector == null
                                    ? new Enumerable(<Array<TOut>><any>myEnumerator.Current)
                                    : new Enumerable(selector(myEnumerator.Current, index++));
                        */

                        var children = selector == null
                                    ? new (me as any).constructor(<Array<TOut>><any>myEnumerator.Current)
                                    : new (me as any).constructor(selector(myEnumerator.Current, index++));                                   
        
                        if (children != null)
                        {
                            var childEnumerator = children.GetEnumerator();
                            while (childEnumerator.MoveNext())
                                yield childEnumerator.Current;
                        }
                    }
                } as () => IterableIterator<TOut>
        
                //return new Enumerable<TOut>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /**
             * Filters a sequence of values based on a predicate.
             * @param selector The filter predicate.
             */
            @EnumerableSerialization.DataMember()
            public Where(selector: (element: T, index?: number) => boolean): IEnumerableOps<T>
            {
                var me = this;
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    var index = 0;
        
                    if (selector == null) selector = (a, b) => true;
        
                    while (myEnumerator.MoveNext())
                        if (selector(myEnumerator.Current, index++))
                            yield myEnumerator.Current;
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /** Gets the first element of a sequence, or null if empty. */
            public FirstOrNull(): T
            {
                var myEnumerator = this.GetEnumerator();

                myEnumerator.MoveNext();
        
                return myEnumerator.Current === undefined
                    ? null
                    : myEnumerator.Current;
            }
        
            /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
            public LastOrNull(): T    
            {
                var list = this.ToList();
        
                return list.length == 0
                    ? null
                    : list[list.length - 1];
            }
        
            /** Produces a new enumeration in reverse order, which implies that the enumeration is finite. */
            public Reverse(): Array<T>
            {
                var list = this.ToList();
                return list.reverse();
            }
        
            /** Gets all entries which are not null, and in string enumerations, not empty. */
            @EnumerableSerialization.DataMember()
            public NotNullOrEmpty(): IEnumerableOps<T>
            {
                return this.Where(z => z != null && !String.IsNullOrWhiteSpace(z.toString()));
            }
        
            /** If a given element exists within the enumeration. */
            public Contains(element: T): boolean
            {
                return this.Where(z => Object.AreEqual(z, element))
                           .Any();
            }

            /** If a given element does not exist within the enumeration. */
            public NotContains(element: T): boolean
            {
                return !this.Contains(element);
            }
            /**
            * Sorts the sequence in ascending order.
            * @param comparer The sorting criteria;
            */
            public OrderBy<TKey>(comparer?: (a: T, b: T) => number | any): Array<T>
            {
                var list = this.ToList();
        
                var actualComparer = comparer == null
                    ? (a, b) => EnumerableSystem.OrdinalComparer(a, b)
                    : (a, b) =>
                    {
                        if (comparer.length <= 1) //simple criterion, e.g. z => z.DisplayName
                            return EnumerableSystem.OrdinalComparer(comparer(a, undefined), comparer(b, undefined))
        
                        var comparison = comparer(a, b);
                        return comparison == null || comparison.GetType() != "Number"
                            ? EnumerableSystem.OrdinalComparer(a, comparison)
                            : comparison;
                    };
        
                var result = list == null
                            ? null
                            : list.length == 0
                                ? list
                                : list.sort((a, b) => actualComparer(a, b));
        
                return result;
            }
        
            /**
            * Sorts the sequence in ascending order.
            * @param comparer The sorting criteria;
            */
            public OrderByDescending<TKey>(comparer?: (a: T, b: T) => number | any): Array<T>
            {
                var list = this.ToList();
        
                var actualComparer = comparer == null
                    ? (a, b) => EnumerableSystem.OrdinalComparer(a, b)
                    : (a, b) =>
                    {
                        if (comparer.length <= 1) //simple criterion, e.g. z => z.DisplayName
                            return EnumerableSystem.OrdinalComparer(comparer(a, undefined), comparer(b, undefined))
        
                        var comparison = comparer(a, b);
                        return comparison == null || comparison.GetType() != "Number"
                               ? EnumerableSystem.OrdinalComparer(a, comparison)
                               : comparison;
                    };
        
                var result = list == null
                             ? null
                             : list.length == 0
                                ? list
                                : list.sort((a, b) => actualComparer(b, a));
        
                return result;
            }
        
            /** Get the distinct members, which relies on Equals(). */
            @EnumerableSerialization.DataMember()        
            public Distinct(equalityComparer?: (a: T, b: T) => boolean): IEnumerableOps<T>
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
                        if (!selector(myEnumerator.Current))
                        {
                            popped.push(myEnumerator.Current);
                            yield myEnumerator.Current;
                        }
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /** Takes elements of a sequence until a duplicate is found, which relies on Equals(). */
            @EnumerableSerialization.DataMember()
            public TakeWhileDistinct(): IEnumerableOps<T>
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
                        if (!selector(myEnumerator.Current))
                        {
                            popped.push(myEnumerator.Current);
                            yield myEnumerator.Current;
                        }
                        else
                            stop = true;
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /** Skips elements of a sequence until a duplicate is found, which relies on Equals(). */
            @EnumerableSerialization.DataMember()
            public SkipWhileDistinct(): IEnumerableOps<T>
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
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /**
             * Groups the items in a collection based, and produces a map/dictionary where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
             * @param keySelector The group by criterion.
             */
            @EnumerableSerialization.DataMember()
            public GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerableOps<IGrouping<TIn, T>>
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

                    } as () => IterableIterator<{ Key: TIn, Values: T[] }>;

                    var lineEnumerator = new Enumerable(lineIterator).GetEnumerator();

                    var groupIterator = function*()
                    {
                        while (lineEnumerator.MoveNext())
                        {
                            while (poppedGroupCount < popped.length)
                            {
                                poppedGroupCount++;
                                yield popped[poppedGroupCount - 1];
                            }
                        }

                    } as () => IterableIterator<{ Key: TIn, Values: T[] }>;

                    var groupsEnumerator = new Enumerable(groupIterator).GetEnumerator();

                    while (groupsEnumerator.MoveNext())
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
                                while (nextIndex < loadedValues.length)
                                    yield loadedValues[nextIndex++];    
                            }

                        } as () => IterableIterator<T>;

                        var values = new Enumerable(valuesIterator);
                        Object.defineProperty(values, "Key", { get: () => currentKey, enumerable: true });

                        yield values as any as IGrouping<TIn, T>;
                    }
                    
                } as () => IterableIterator<IGrouping<TIn, T>>
        
                //return new Enumerable<IGrouping<TIn, T>>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }

            /**
             * Groups the items in a collection based on a key and its sequence, and produces an enumeration where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
             * There may be groups with the same key depending on their order in the enumeration.
             * @param keySelector The group by criterion.
             */    
            @EnumerableSerialization.DataMember()
            public GroupByConsecutive<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerableOps<IGrouping<TIn, T>>
            {    
                var me = this;
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    var index = -1;
        
                    var current: T = undefined as any;
                    var continueCycle = true;
        
                    while (continueCycle)
                    {                
                        if (current === undefined)
                        {
                            index++;
        
                            if (myEnumerator.MoveNext())
                                current = myEnumerator.Current;
                            else
                            {
                                continueCycle = false; // exit
                                break;
                            }
                        }
        
                        var transformed = keySelector == null
                                        ? current as any as TIn
                                        : keySelector(current, index);
        
                        var values = [current];
        
                        var isEqual = true;
        
                        var continueCycle2 = true;
        
                        while (continueCycle2)
                        {
                            if (!myEnumerator.MoveNext())
                            {
                                continueCycle = false;
                                continueCycle2 = false;
                                break;
                            }
        
                            index++;

                            var newTransformed = keySelector == null
                                                ? myEnumerator.Current as any as TIn
                                                : keySelector(myEnumerator.Current, index);
        
                            isEqual = Object.AreEqual(transformed, newTransformed);
        
                            if (isEqual)
                                values.push(myEnumerator.Current);
                            else
                            {
                                current = myEnumerator.Current;
                                continueCycle2 = false;
                            }
                        }
        
                        var valuesEnum = new Enumerable(values);
                        Object.defineProperty(valuesEnum, "Key", { get: () => transformed});

                        yield valuesEnum as any as IGrouping<TIn, T>;           
                    }
        
                    // yield break
                } as () => IterableIterator<IGrouping<TIn, T>>
        
                //return new Enumerable(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /**
             * Produces the intersection of two sequences.
             * @param sequence The sequence to intersect.
             */
            @EnumerableSerialization.DataMember()
            public Intersect(sequence: IEnumerableOps<T>): IEnumerableOps<T>
            {
                var me = this;
        
                var what = sequence;
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
                    var secondEnumerator = what.GetEnumerator();
                    var reachedEnd = false;
                    var popped: Array<T> = [];
                    var index = -1;
        
                    while (myEnumerator.MoveNext())
                    {
                        index++;
        
                        //optimistic math
                        if (!reachedEnd && popped.length == index)
                        {
                            if (secondEnumerator.MoveNext())
                                popped.unshift(secondEnumerator.Current);
                            else
                                reachedEnd = true;
                        }
        
                        if (popped.Contains(myEnumerator.Current))
                        {
                            //contains
                            yield myEnumerator.Current
                        }
                        else
                        {
                            var found = false;
                            while (!reachedEnd && secondEnumerator.MoveNext())
                            {
                                var z = secondEnumerator.Current;
                                var element = myEnumerator.Current;
        
                                popped.unshift(z);
        
                                if (Object.AreEqual(z, element))
                                {
                                    //contains
                                    found = true;
                                    break;
                                }
                            }
        
                            if (!found)
                                reachedEnd = true;
                            else
                                yield myEnumerator.Current;
                        }
                    }
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            }
        
            /**
            * Produces the exclusion of elements from a sequence.
            * @param sequence The sequence to subtract.
            */
            @EnumerableSerialization.DataMember()       
            public Except(sequence: IEnumerableOps<T>): IEnumerableOps<T>
            {
                var me = this;
        
                var what = sequence;
        
                var combinedIterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
                    var secondEnumerator = what.GetEnumerator();
                    var reachedEnd = false;
                    var popped: Array<T> = [];
                    var index = -1;
        
                    while (myEnumerator.MoveNext())
                    {
                        index++;
        
                        //optimistic math, 
                        if (!reachedEnd && popped.length == index)
                        {
                            if (secondEnumerator.MoveNext())
                                popped.unshift(secondEnumerator.Current);
                            else
                                reachedEnd = true;
                        }
        
                        if (popped.Contains(myEnumerator.Current))
                        {
                            //contains    
                        }
                        else
                        {
                            var found = false;
                            while (!reachedEnd && secondEnumerator.MoveNext())
                            {
                                var z = secondEnumerator.Current;
                                var element = myEnumerator.Current;
        
                                popped.unshift(z);
        
                                if (Object.AreEqual(z, element))
                                {
                                    //contains
                                    found = true;
                                    break;
                                }
                            }
        
                            if (!found)
                            {
                                reachedEnd = true;
                                yield myEnumerator.Current;
                            }
                        }
                    }
                }  as () => IterableIterator<T>
        
                //return new Enumerable<T>(combinedIterator);
                return new (this as any).constructor(combinedIterator); // Enumerable or ParallelQuery
            } 
        
            /**
             * Produces the set union of two sequences by using the default equality comparer.
             * Different from Concat since only distinct members of the second sequence will end up in the new enumeration.    
             * @param sequence The sequence to union.
             */
            @EnumerableSerialization.DataMember()       
            public Union(sequence: IEnumerableOps<T>): IEnumerableOps<T>
            {
                var what = sequence != null && (sequence as any).Any == null // array or IEnumerable without IEnumerableOps
                           ? new Enumerable(<Array<T>>sequence)
                           : sequence as IEnumerableOps<T>;
        
                return what == null || !what.Any()
                       ? this as any
                       : this.Concat(what.Where(z => !this.Contains(z)));
            }
        
            /**
             * Bypasses a specified number of contiguous elements from the start of the sequence.         
             * @param count The number of elements to bypass.
             */
            @EnumerableSerialization.DataMember()
            public Skip(count: number): IEnumerableOps<T>
            {
                return this.Where((z, i) => i >= count);
            }
        
            /**
             * Returns a specified number of contiguous elements from the start of the sequence.
             * @param count The number of elements to take.
             */
            @EnumerableSerialization.DataMember()        
            public Take(count: number): IEnumerableOps<T>
            {
                var me = this;
        
                var iterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    var index = 0;
        
                    while (index++ < count && myEnumerator.MoveNext())
                        yield myEnumerator.Current;
                }  as () => IterableIterator<T>
        
                //return new Enumerable<T>(iterator);
                return new (this as any).constructor(iterator); // Enumerable or ParallelQuery
            }
        
            /**
             * Skips the collection while a condition is tru.
             * @param condition The condition that while true will skip the member.
             */
            @EnumerableSerialization.DataMember()        
            public SkipWhile(condition: (member: T) => boolean): IEnumerableOps<T>
            {
                var me = this;
        
                var iterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    var endedSkipping = false;
        
                    while (myEnumerator.MoveNext())
                    {
                        endedSkipping = endedSkipping || condition == null || !condition(myEnumerator.Current);
        
                        if (endedSkipping) yield myEnumerator.Current;
                    }
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(iterator);
                return new (this as any).constructor(iterator); // Enumerable or ParallelQuery
            }
        
            /**
             * Returns a specified number of contiguous elements from the start of the sequence.
             * @param condition The selector of elements to take.
             */
            @EnumerableSerialization.DataMember()        
            public TakeWhile(condition: (item: T) => boolean): IEnumerableOps<T>
            {
                var me = this;
        
                var iterator = function* ()
                {
                    var myEnumerator = me.GetEnumerator();
        
                    var taking = true;
        
                    while (taking && myEnumerator.MoveNext())
                    {
                        taking = (taking || condition == null) && condition(myEnumerator.Current);
        
                        if (taking) yield myEnumerator.Current;
                    }
                } as () => IterableIterator<T>
        
                //return new Enumerable<T>(iterator);
                return new (this as any).constructor(iterator); // Enumerable or ParallelQuery
            }
        
            /**
            * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.        
            * @param second The sequence to zip.
            * @param resultSelector The predicate that joins an element of T and another of Tsecond and creates a TOut.
            */
            @EnumerableSerialization.DataMember()        
            public Zip<Tsecond, TOut>(second: IEnumerableOps<Tsecond>, resultSelector?: (element: T, second: Tsecond, index?: number) => TOut): IEnumerableOps<TOut>
            {
                var what = second != null && (second as any).Any == null // array or IEnumerable without IEnumerableOps
                        ? new Enumerable(<Array<Tsecond>>second)
                        : second as any as IEnumerableOps<T>;
        
                var outputProducer = resultSelector != null
                                    ? resultSelector
                                    : (element, second, index) => <any>{ Item1: element, Item2: second };
        
                return this.Select((z, i) => ({
                                                    Element: z,
                                                    Second: what.Skip(i).FirstOrNull()
                                              }))
                            .Select((z, i) => outputProducer(z.Element, z.Second, i));
            }
        
            /**
             * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
             * @param second The second enumeration to interleave with.
             */
            @EnumerableSerialization.DataMember()
            public Interleave(second: IEnumerableOps<T>): IEnumerableOps<T>   
            {
                var what = second != null && (second as any).Any == null // array or IEnumerable without IEnumerableOps
                           ? new Enumerable(<Array<T>>second)
                           : second as IEnumerableOps<T>;
        
                if (what == null || !what.Any()) return this as any;
                if (!this.Any()) return what as any;
        
                return this.Zip(what as any, (a, b) => [a, b]).SelectMany(z => z) as any;
            }

            /**
             * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
             * @param keySelector A function to extract the key from each element.
             * @param valueSelector A function to extract the value from each element.
             */        
            public ToDictionary<TKey, TOut extends IEnumerableOps<any>>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix_Collections.Collections.HashMap<TKey, IEnumerableOps<TOut>>
            {
                var result: any = {};
        
                var entries = this.Select((z, i) => ({
                                                            Key: keySelector(z, i),
                                                            Value: valueSelector == null ? null : valueSelector(z, i)
                                                    }))
                                .GroupBy(z => z.Key)
                                .Select(z => ({ Key: z.Key, Value: z.Select(w => w.Value).ToList() }))
                                .ToList();

                return new Accelatrix_Collections.Collections.HashMap(entries as any);
            }
        
            /** Sums all quantitative items in the collection. */
            public Sum<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T
            /**
            * Sums all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */            
            public Sum<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>>(selector?: (element: T, index?: number) => TOut): TOut
            public Sum<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>>(selector?: (element: T, index?: number) => TOut): TOut
            {
                var elements = selector == null
                                ? this.Where(z => z != null).ToList()
                                : this.Select((z, i) => selector(z, i))
                                      .Where(z => z != null)
                                      .ToList();

                if (!elements.Any())
                    return 0 as TOut;

                var result = Accelatrix["Quantity"].Add(elements);

                return result == null
                       ? null as any
                       : elements[0].GetType().Name == "Number"
                         ? (result as any).Amount
                         : result;
            }
        
            /** Averages all quantitative items in the collection. */
            public Average<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T
            /**
             * Averages all quantitative items in the collection.
             * @param selector An optional selector to extract only the quantitative elements of the collection.
             */
            public Average<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(selector?: (element: T, index?: number) => TOut): TOut
            public Average<TOut extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(selector?: (element: T, index?: number) => TOut): TOut
            {
                let elements = this.Select((z, i) => selector == null ? z as any as TOut : selector(z, i))
                                   .Where(z => z != null)
                                   .ToList();

                let isDate = elements.Take(1).Where(z => z != null && (z instanceof Date)).Any();
                if (isDate) // Date support
                {
                    var dates = (elements as Array<any>).OfType(Date).Select(z => z.getTime()).ToList();
                    var min = dates.Min();
                    var dateSum = dates.Select(z => z - min).Sum();

                    return new Date(min + Math.round(dateSum / elements.length)) as TOut;
                }

                let sum = elements.Sum() as number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>;
                
                if (sum == null) return null as any;

                let isNumber = sum.GetType().Name == "Number";

                let avg = isNumber
                          ? (sum as number) / elements.Count()
                          : (sum as Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>).Amount / elements.Count();

                if (isNumber)
                    return avg as TOut;

                if (!Object.isFrozen(sum))
                {
                    try
                    {
                        Object.defineProperty(sum, "Amount", { value: () => avg, enumerable: true });
                    }
                    catch(ex) // cannot redefine property
                    {
                        return [ sum, avg - (sum as Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>).Amount ].Sum() as TOut;
                    }
                    
                    return sum as TOut;
                }
                
                return [ sum, avg - (sum as Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>).Amount ].Sum() as TOut;
            }
        
            /** Max of all quantitative items in the collection. */
            public Max<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T
            /**
             * Max of all quantitative items in the collection.
             * @param comparer An optional comparer.
             */
            public Max(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): T
            public Max(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): T
            {
                if (!this.Any()) return null as any;
        
                var result = this.Where(z => z != null)
                                 .OrderByDescending(z => comparer != null
                                                         ? comparer
                                                         : z != null && z.GetType().Name == "Date"
                                                            ? (<Date><any>z).getTime()
                                                            : z["Amount"] != null
                                                                ? z["Amount"]
                                                                : z)
                                 .FirstOrNull();
        
                if (result == null) return null as any;

                return result instanceof Date
                       ? result as T
                       : [ result as any as number, 0 ].Sum() as any as T;
            }
        
            /** Min of all quantitative items in the collection. */
            public Min<TMember extends number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit> | Date>(): T
            /**
             * Min of all quantitative items in the collection.
             * @param comparer An optional comparer.
             */
            public Min(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): T
            public Min(comparer?: (a: T, b: T) => number | Accelatrix_Number.IQuantity<Accelatrix_Number.IUnit>): T
            {
                if (!this.Any()) return null as any;
        
                var result = this.Where(z => z != null)
                                 .OrderBy(z => comparer != null
                                               ? comparer
                                               : z != null && z.GetType().Name == "Date"
                                                 ? (<Date><any>z).getTime()
                                                 : z["Amount"] != null
                                                    ? z["Amount"]
                                                    : z)
                                 .FirstOrNull();
        
                if (result == null) return null as any;

                return result instanceof Date
                       ? result as T
                       : [ result as any as number, 0 ].Sum() as any as T;
            }
        
            /**
            * Creates a sequence of numbers.
            * @param start The first position of the sequence.
            * @param count The number of items in the sequece. If none is specified, the sequence will be infinite.
            */
            public static Range(start: number, count?: number): IEnumerableOps<number>
            {
                if (start == null) return null as any;
        
                var interator = function* ()
                {
                    var item = start;
        
                    while (count == null || item - start < count)
                        yield item++;
                } as () => IterableIterator<number>
        
                let result = new Enumerable<number>(interator);
                
                result.toJSON = () =>
                {
                    let jSON = {
                                "$type": "Accelatrix.Collections.Enumerable",
                                Members: [
                                                { 
                                                    Op: function Enumerable_Range(a, b) { return self["Accelatrix"].Collections.Enumerable.Range(a, b) },
                                                    Args: [start, count]
                                                }
                                        ]
                            }

                    return jSON as any;
                };

                return result as any;
            }
        }

        namespace EnumerableSystem
        {
            export function OrdinalComparer<T>(first: T, second: T): number
            {
                if (first == null && second == null) return 0;
                if (first == null && second != null) return 1;
                if (first != null && second == null) return -1;
                if (first == second) return 0;
                if (first.Equals(second)) return 0;
        
                return first > second
                       ? 1
                       : -1;
            }
        
            //******** Defend against package managers that rename symbols */
            Object.defineProperty(Enumerable.prototype.constructor, "name", { get: () => "Enumerable" });
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// ----------------------------------- ARRAY ------------------------------------------------------
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

Array.prototype.GetEnumerator = function (): Accelatrix.Collections.IEnumerator<any> 
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).GetEnumerator();
}

Array.prototype.OfType = function <Tfilter>(type: any): Accelatrix.Collections.IEnumerableOps<Tfilter>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).OfType(type);
}

Array.prototype.Any = function (): boolean
{
    return this != null && this.length > 0;
}

Array.prototype.NotAny = function (): boolean
{
    return this == null || this.length <= 0;
}

Array.prototype.Freeze = function (): Accelatrix.Collections.IEnumerableOps<any>
{
    var result = new Accelatrix.Collections.Enumerable(<Array<any>>this).Freeze();
    Object.defineProperty(this, "Freeze", { value: () => result });
    return result;
}

Array.prototype.ToList = function (): Array<any>
{
    return this;
}

Array.prototype.ToEnumerable = function (): Array<any>
{
    return new Accelatrix.Collections.Enumerable([<Array<any>>this]) as any;
}

Array.prototype.Count = function (): number
{
    return this.length;
}

Array.prototype.ForEach = function (action: (element: any, index?: number) => boolean | void | any): void
{
    var doBreak = false;
    for (var i = 0; i < this.length; i++)
    {
        if (doBreak)
            break;
        else
        {
            var result = action(this[i], i);
            doBreak = result === false;
        }
    }
}

Array.prototype.Concat = function (second: Accelatrix.Collections.IEnumerableOps<any>): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Concat(second);
}

Array.prototype.Select = function <TOut>(selector: (element: any, index?: number) => TOut): Accelatrix.Collections.IEnumerableOps<TOut>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Select(selector);
}

Array.prototype.SelectMany = function <TOut>(selector: (element: any, index?: number) => Accelatrix.Collections.IEnumerableOps<TOut>): Accelatrix.Collections.IEnumerableOps<TOut>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).SelectMany(selector);
}

Array.prototype.Where = function (selector: (element: any, index?: number) => boolean): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Where(selector);
}

Array.prototype.FirstOrNull = function (): any
{
    return this == null || !this.Any()
        ? null
        : this[0];
}

Array.prototype.LastOrNull = function (): any
{
    return this == null || !this.Any()
        ? null
        : this[this.length - 1];
}

Array.prototype.Reverse = function (): Array<any>
{
    return (<Array<any>>this).reverse();
}

Array.prototype.NotNullOrEmpty = function (): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).NotNullOrEmpty();
}

Array.prototype.Contains = function (element: any): boolean
{
    //return new Enumerable(<Array<any>>this).Contains(element);
    for (var i = 0; i < this.length; i++)
    {
        var z = this[i];
        if ((z == element) || (z === null && element === null) || (z === undefined && element === undefined) || (z != null && z.Equals(element)))
            return true;
    }
    return false;
}

Array.prototype.NotContains = function (element: any): boolean
{
    return !this.Contains(element);
}

Array.prototype.OrderBy = function <TKey>(comparer?: (a: any, b: any) => number | any): Array<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).OrderBy(comparer);
}

Array.prototype.OrderByDescending = function <TKey>(comparer?: (a: any, b: any) => number | any): Array<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).OrderByDescending(comparer);
}

Array.prototype.Distinct = function (): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Distinct();
}

Array.prototype.TakeWhileDistinct = function (): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).TakeWhileDistinct();
}

Array.prototype.SkipWhileDistinct = function (): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).SkipWhileDistinct();
}

Array.prototype.GroupBy = function (keySelector: (element: any, index?: number) => any)
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).GroupBy(keySelector);
}

Array.prototype.GroupByConsecutive = function (keySelector: (element: any, index?: number) => any)
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).GroupByConsecutive(keySelector);
}

Array.prototype.Intersect = function (sequence: Accelatrix.Collections.IEnumerableOps<any>): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Intersect(sequence);
}

Array.prototype.Except = function (sequence: Accelatrix.Collections.IEnumerableOps<any>): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Except(sequence);
}

Array.prototype.Union = function (sequence: Accelatrix.Collections.IEnumerableOps<any>): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Union(sequence);
}

Array.prototype.Skip = function (count: number): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Skip(count);
}

Array.prototype.Take = function (count: number): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Take(count);
}

Array.prototype.SkipWhile = function (condition: (member: any) => boolean): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).SkipWhile(condition);
}

Array.prototype.TakeWhile = function (condition: (member: any) => boolean): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).TakeWhile(condition);
}

Array.prototype.Zip = function <Tsecond, TOut>(second: Accelatrix.Collections.IEnumerableOps<Tsecond>, resultSelector?: (element: any, second: Tsecond, index?: number) => TOut): Accelatrix.Collections.IEnumerableOps<TOut>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Zip(second, resultSelector);
}

Array.prototype.Interleave = function (second: Accelatrix.Collections.IEnumerableOps<any>): Accelatrix.Collections.IEnumerableOps<any>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Interleave(second);
}

Array.prototype.ToDictionary = function <TKey, TValue extends Accelatrix.Collections.IEnumerableOps<any>>(keySelector: (element: any, index?: number) => TKey, valueSelector: (element: any, index?: number) => TValue): Accelatrix_Collections.Collections.HashMap<TKey, Accelatrix.Collections.IEnumerableOps<TValue>>
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).ToDictionary(keySelector, valueSelector);
}

Array.prototype.Sum = function (selector?: (element: any, index?: number) => number | any): any
{
    return new  Accelatrix.Collections.Enumerable(<Array<any>>this).Sum(selector);
}

Array.prototype.Average = function (selector?: (element: any, index?: number) => number | any): any
{
    return new  Accelatrix.Collections.Enumerable(<Array<any>>this).Average(selector);
}

Array.prototype.Max = function (selector?: (element: any, index?: number) => number | any): any 
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Max(selector);
}

Array.prototype.Min = function (selector?: (element: any, index?: number) => number | any): any
{
    return new Accelatrix.Collections.Enumerable(<Array<any>>this).Min(selector);
}

Object.defineProperty(Object, "FlattenHierarchy",
{
    value: function(obj: object, childEnumerator: (item: any) => Accelatrix.Collections.IEnumerableOps<any>): Accelatrix.Collections.IEnumerableOps<any>
           {
                if (obj == null)
                    return null;

                try
                {
                    return childEnumerator != null && childEnumerator(obj) != null
                           ? [obj].Concat(childEnumerator(obj).SelectMany((z: any) => z == null ? [] : <any>Object.FlattenHierarchy(z, childEnumerator as any)))
                           : [obj];
                }
                catch(e) //freed script
                {
                    return [obj];
                }
           },
    enumerable: false
});