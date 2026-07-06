/// <reference path="./Base.ts" />
/// <reference path="./Type.ts" />
/// <reference path="./Number.ts" />

import { Accelatrix as Accelatrix_Enumerable } from "./Enumerable";
import { Accelatrix as Accelatrix_Base } from "./Base";

export namespace Accelatrix
{
    /** Collectipns namespace. */
    export namespace Collections
    {
        /** A dictionary where the key is of any type. */
        export interface IHashMap<TKey, TMember> extends Accelatrix_Enumerable.Collections.IEnumerableOps<{ Key: TKey, Value: TMember }>
        {
            /** Gets the enumeration of keys. */
            readonly Keys: Accelatrix_Enumerable.Collections.IEnumerableOps<TKey>;

            /** Gets the enumeration of values. */
            readonly Values: Accelatrix_Enumerable.Collections.IEnumerableOps<TMember>;

            /** Indicates if a given key already exists. */
            ContainsKey(key: TKey) : boolean;

            /**
             * Adds an entry to the collection.
             * @param key The key of the entry.
             * @param value The value.
             */
            Add(key: TKey, value: TMember);

            /** Remove an entry based on the key. */
            Remove(key: TKey);
        }

        /** A dictionary where the key is of any type. */
        export class HashMap<TKey, TMember> extends Array<{ Key: TKey, Value: TMember }> implements IHashMap<TKey, TMember>
        {
            /** Creates a new HashMap instance. */
            public constructor()
            /**
             * Creates a new HashMap instance.
             * @param members The collection of members.
             */
            public constructor(members: Accelatrix_Enumerable.Collections.IEnumerableOps<{ Key: TKey, Value: TMember }>)
            public constructor(members?: Accelatrix_Enumerable.Collections.IEnumerableOps<{ Key: TKey, Value: TMember }>)
            {        
                super();

                var myMembers: Array<any> = [];
                var mySplice = this.splice.bind(this);
                var myPush = this.push.bind(this);

                Object.defineProperty(this, "$type", { get: () =>
                {
                    return "Accelatrix.Collections.HashMap";
                },
                enumerable: true});


                Object.defineProperty(this, "ContainsKey", { value: (key: TKey) =>
                {
                    return myMembers.Where(z => key == null
                                                ? z.Key == null
                                                : z.Hash == key.GetHashCode())
                                     .Any();
                }});

                Object.defineProperty(this, "Add", { value: (key: TKey, value: TMember) =>
                {
                    if (key == null)
                        throw new Accelatrix_Base.ArgumentNullException("key");

                    if (this.ContainsKey(key))
                        throw new DuplicateMemberException(key);

                    if (key != null)
                        key["toString"] = () => key.GetHashCode(true) as any;

                    //Object.defineProperty(key, "toString", { value: () => key.GetHashCode(true) });
                    myMembers.push(({ Key: key, Hash: key.GetHashCode(true), Value: value }));
                    myPush({ Key: key, Value: value});
                }});

                Object.defineProperty(this, "Keys", { get: () =>
                {
                    return myMembers.Select(z => z.Key).ToList();
                }});

                Object.defineProperty(this, "Values", { get: () =>
                {
                    return myMembers.Select(z => z.Value).ToList();
                }});

                Object.defineProperty(this, "Remove", { value: (key: TKey) =>
                {
                    myMembers.Select((z, i) => ({ Index: i, Hash: z.Hash }))
                             .Where(z => key == null ? z.Hash == 0 : z.Hash == key.GetHashCode())
                             .Take(1)
                             .ForEach(z =>
                             { 
                                myMembers.splice(z.Index, 1);
                                mySplice(z.Index, 1);
                             });
                }});

                Object.defineProperty(this, "toJSON", { value: () =>
                {
                    var me = myMembers.Select(z => ({ Key: z.Key, Value: z.Value })).ToList();
                    
                    return ({
                                    $type: "Accelatrix.Collections.HashMap",
                                    Members: me
                            });
                }});

                // Object.defineProperty(this, "push", { value: (entry: { Key: TKey, Value: TMember }) => this.Add(entry == null ? null : entry.Key, entry == null ? null : entry.Value ) });
                if (members != null)
                    members.ForEach(z => this.Add(z.Key, z.Value));

                delete this.push;
                delete this.splice;
                delete this.shift;
                delete this.slice;
                delete this.sort;
                delete this.fill;
                delete this.unshift;
                delete this.keys;
            }

            /** Gets the enumeration of keys. */
            public get Keys(): Array<TKey>
            {
                return null as any;
            }

            /** Gets the enumeration of values. */
            public get Values(): Array<TMember>
            {
                return null as any;
            }

             /** Indicates if a given key already exists. */
            public ContainsKey(key: TKey) : boolean
            {
                return false;
            }

            /**
             * Adds an entry to the collection.
             * @param key The key of the entry.
             * @param value The value.
             */
            public Add(key: TKey, value: TMember)
            {

            }

            /** Remove an entry based on the key. */
            public Remove(key: TKey)
            {

            }        
        }

        /** An exception depicting a duplicate member. */
        export class DuplicateMemberException extends Accelatrix_Base.Exception
        {
            /**
             * Creates a new ArgumentNullException.
             * @param member The member.
             */
            public constructor(member: any)
            /**
             * Creates a new ArgumentNullException.
             * @param message A custom message.
             * @param member The member.
             */
            public constructor(message: string, member: any)
            /**
             * Creates a new ArgumentNullException.
             * @param message  A custom message.
             * @param member The member.
             */
            public constructor(message: any, member?: string)
            {
                let msg = String.IsNullOrWhiteSpace(member)
                        ? "Member '" + (message).ToString() + "' already exists."
                        : message;

                super(msg);

                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Collections.DuplicateMemberException"});
            }
        }

        namespace CollectionsSystem
        {
            //******** Defend against package managers that rename symbols */
            Object.defineProperty(HashMap.prototype.constructor, "name", { get: () => "HashMap" });
            Object.defineProperty(DuplicateMemberException.prototype.constructor, "name", { get: () => "DuplicateMemberException" });
        }        
    }
}