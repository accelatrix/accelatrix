/// <reference path="./Base.ts" />
/// <reference path="./Date.ts" />

import { Accelatrix as Accelatrix_Type } from "./Type";
import { Accelatrix as Accelatrix_Enumerable } from "./Enumerable";

export namespace Accelatrix
{

    /** Deals with JSON serialization. */
    export namespace Serialization
    {
        /**
         * Parses a JSON string into a typed class where the expected type in contained in a $type property.
         * @param json The JSON string to deserialize.
         * @returns Returns the deserialized class according to the specified type.
         */
        export function FromJSON<T>(json: string) : T        
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param type The type constructor, e.g. the reference to the class definition.
         * @returns Returns the deserialized class according to the specified type.
         */
        export function FromJSON<T>(json: string, type: { new (...args: any[]): T }) : T
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param type The Accelatrix.Type of the type to filter.
         * @returns Returns the deserialized class according to the specified type.
         */
        export function FromJSON<T>(json: string, type: Accelatrix_Type.Type) : T
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param typeName The name or full name of the type or its alias ($type).
         * @returns Returns the deserialized class according to the specified type.
         */            
        export function FromJSON<T>(json: string, typeName: string) : T
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param type The type constructor, e.g. the reference to the class definition.
         * @returns Returns the deserialized class according to the specified type.
         */            
        export function FromJSON<T>(json: string, type?: { new (...args: any[]): T } | Accelatrix_Type.Type | string) : T    
        {
            return SerializationSystem.ParseJSON(json, type);
        }

        /**
         * Serializes an object as JSON and includes $type annotations.
         * @param obj The object to serialize.
         */
        export function ToJSON(obj: any)
        {
            return SerializationSystem.Stringify(obj);
        }

        /**
         * Decorator to mark a class in order to register its type during a deserialization process.
         * @param constructor The class constructor.
         */
        export function KnownType<T extends { new (...args: any[]): {} }>(constructor: T)
        /**
         * Decorator to mark a class in order to register its type during a deserialization process.
         * @param alias The alias of the type, which should include namespace information, e.g. Bio.Mamal.Dog.
         */ 
        export function KnownType<T extends { new (...args: any[]): {} }>(alias: string)
        /**
         * Decorator to mark a class in order to register its type during a deserialization process.
         * @param constructorOrAlias The type's constructor or alias of the type, which should include namespace information, e.g. Bio.Mamal.Dog.
         */         
        export function KnownType<T extends { new (...args: any[]): {} }>(constructorOrAlias?: T | string)
        {   
            var isFunction = false;

            if (constructorOrAlias instanceof Function) // no alias
            {
                isFunction = true;

                var knownType = SerializationSystem.RegisterKnownType(constructorOrAlias as T);
                Object.defineProperty(constructorOrAlias, "$type", { get: () => knownType.Type.GetFullName(), enumerable: true });

                // get all data members
                var dataMembers = Object.getOwnPropertyNames(constructorOrAlias.prototype)
                                        .map(z => ({ Name: z, Descriptor: Object.getOwnPropertyDescriptor(constructorOrAlias.prototype, z)}))
                                        .map(z => ({ 
                                                    Name: z.Name,
                                                    Descriptor: z.Descriptor,
                                                    IsDataMember: z.Descriptor == null
                                                                  ? false
                                                                  : z.Descriptor["get"] != null
                                                                    ? z.Descriptor["get"]["DataMember"] != null
                                                                    : z.Descriptor["DataMember"] != null
                                                 }))
                                        .filter(z => z.IsDataMember);

                dataMembers.ForEach(z => Object.defineProperty(constructorOrAlias.prototype, z.Name, { ...z.Descriptor, enumerable: true }));

                if (knownType.DataMembers == null)
                    knownType.DataMembers = {};

                dataMembers.map(z => z.Name).forEach(z => knownType.DataMembers[z] = { Include: true } );

                return constructorOrAlias;
            }

            return (ctor: T) =>
            {
                if (ctor != null)
                {                    
                    var knownType = SerializationSystem.RegisterKnownType(ctor as T, isFunction ? "" : constructorOrAlias as string);
                    Accelatrix_Type.Type.FromConstructor(ctor, isFunction ? "" : constructorOrAlias as string); // ensure the type is known by the type system
                    Object.defineProperty((ctor as any), "$type", { get: () => knownType.Type.GetFullName(), enumerable: true });
                }

                return ctor;
            }

            /*
            if (constructorOrAlias instanceof Function) // no alias
                return OverrideConstructorToIncludeTypeProperty(constructorOrAlias as T);

            return (ctor: T) =>
            {
                if (ctor != null)
                    return OverrideConstructorToIncludeTypeProperty(ctor as T, constructorOrAlias);

                return ctor;
            }
            */
        }

        function OverrideConstructorToIncludeTypeProperty<T extends { new (...args: any[]): {} }>(constructor: T, alias?: string)
        {            
            // override constructor so that there is always a $type property created.
            var original = constructor;

            var f = function (...args)
            {                
                let _this = original.call(this, args) as any;

                if (_this != null && _this["$type"] == null)
                    Object.defineProperty(_this, "$type", { enumerable: true, configurable: true, get: () => _this.GetType().GetFullName() });                

                return _this;
            };

            Object.defineProperty(f, "name", { value: original["name"] });
            
            f.prototype = original.prototype;
            f["__proto__"] = original["__proto__"];

            Object.keys(original)
                  .forEach(z => f[z] = original[z]);            

            SerializationSystem.RegisterKnownType(f as any as T, alias);

            return <T><any>f;            
        }

        /**
         * A decorator to mark a property as serializable.
         * Be warned: Newer versions of TypeScript compilers tend to remove propery setters when decorators are used. Set experimentalDecorators to true if you wish to overcome this.
         */
        export function DataMember()
        /**
         * A decorator to mark a property as serializable.
         * Be warned: Newer versions of TypeScript compilers tend to remove property setters when decorators are used. Set experimentalDecorators to true if you wish to overcome this.
         * @param include If it should be included.
         */
        export function DataMember(include: boolean)
        /**
         * A decorator to mark a property as serializable.
         * Be warned: Newer versions of TypeScript compilers tend to remove property setters when decorators are used. Set experimentalDecorators to true if you wish to overcome this.
         * @param name Serialize with a different name.
         */
        export function DataMember(name: string)        
        /**
         * A decorator to mark a property as serializable.
         * Be warned: Newer versions of TypeScript compilers tend to remove propery setters when decorators are used. Set experimentalDecorators to true if you wish to overcome this.
         * @param include If it should be included.
         */
        export function DataMember(include?: boolean | string)
        {
            return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
            {
                /*
                var propName = propertyKey != null && propertyKey["name"] != null
                               ? propertyKey["name"]
                               : propertyKey;
                               */

                let shouldInclude = include == null || (<any>include instanceof String || typeof include == "string");
                let name = String.IsNullOrWhiteSpace(include as string) || !(<any>include instanceof String || typeof include == "string") ? null : include as string;

                target["DataMember"] = shouldInclude;
                SerializationSystem.EnrichKnownType(target, null, null, null, null, { propertyKey: propertyKey, include: shouldInclude, alias: name as any});
            };
        }

        /** Decorator to tag the method to be invoked when serialization begins. */
        export function OnSerializing()
        {
            return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor)
            {
                SerializationSystem.EnrichKnownType(target, target[propertyKey], null, null, null);
            };            
        }

         /** Decorator to tag the method to be invoked when serialization ends. */
         export function OnSerialized()
         {
             return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor)
             {
                SerializationSystem.EnrichKnownType(target, null, target[propertyKey], null, null);
             };            
         }

        /** Decorator to tag the method to be invoked when deserialization begins. */
        export function OnDeserializing()
        {
            return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor)
            {
                SerializationSystem.EnrichKnownType(target, null, null, target[propertyKey], null);
            };            
        }

         /** Decorator to tag the method to be invoked when deserialization ends. */
         export function OnDeserialized()
         {
             return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor)
             {
                SerializationSystem.EnrichKnownType(target, null, null, null, target[propertyKey]);
             };            
         }         

        namespace SerializationSystem
        {
            const knownTypes: IKnownTypeRegistration[] = [];
            const base64RegEx = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            /*
                ^                          # Start of input
                ([0-9a-zA-Z+/]{4})*        # Groups of 4 valid characters decode
                                        # to 24 bits of data for each group
                (                          # Either ending with:
                    ([0-9a-zA-Z+/]{2}==)   # two valid characters followed by ==
                    |                      # , or
                    ([0-9a-zA-Z+/]{3}=)    # three valid characters followed by =
                )?                         # , or nothing
                $                          # End of input
            */

            export function ParseJSON<T>(json: string, type?: { new (...args: any[]): T } | Accelatrix_Type.Type | string) : T   
            {
                if (String.IsNullOrWhiteSpace(json))
                    throw new Accelatrix.ArgumentNullException("json");
    
                let targetType : Accelatrix_Type.Type;
                
                if (type != null && type.GetType().Name == "String")
                {
                    let myType = Accelatrix_Type.Type.FromName(type as string) as Array<Accelatrix_Type.Type>;
                    
                    if (myType == null || myType.length == 0)
                        throw new Accelatrix_Type.Type.TypeNotFoundException(type as string);
    
                    if (myType.length != 1)
                        throw new Accelatrix_Type.Type.AmbiguousTypeException(type as string, null, myType);
    
                    targetType = myType[0];
                }
                else if (type != null && type.GetType().IsFunction)
                {
                    targetType = Accelatrix_Type.Type.FromConstructor(type as { new (...args: any[]): T });
                }
                else
                    targetType = type as Accelatrix_Type.Type;

                var rootObj = null;

                let jsonResolver = function(key: string, value: any)
                {   
                    if (rootObj == null)
                        rootObj = this;

                    if (value != null && value instanceof Object)
                    {
                        let proposedType: Accelatrix_Type.Type | null = null;

                        if (!String.IsNullOrWhiteSpace(value["$type"]))
                        {
                            try
                            {
                                proposedType = GetTypeFromHint(value["$type"])
                            }
                            catch(ex)
                            {
                                if (this == rootObj)
                                    proposedType = GetPropertyType(targetType, key);
                                else if (!String.IsNullOrWhiteSpace(this["$type"]))
                                {
                                    try
                                    {
                                        var myType = GetTypeFromHint(this["$type"]);
                                        proposedType = GetPropertyType(myType, key);
                                    }
                                    catch(ex2)
                                    {
                                        // type not unique
                                    }
                                };
                            }
                        }
                        else if (this == rootObj)
                            proposedType = GetPropertyType(targetType, key);
                        else if (!String.IsNullOrWhiteSpace(this["$type"]))
                        {
                            try
                            {
                                var myType = GetTypeFromHint(this["$type"]);
                                proposedType = GetPropertyType(myType, key);
                            }
                            catch(ex2)
                            {
                                // type not unique
                            }
                        };                        

                        if (proposedType != null && !proposedType.IsPrimitive)
                            value = ObjectToClass(value, proposedType);
                    }
                    else if (value != null && (value instanceof String || typeof value == "string"))
                    {
                        if ((value as string).length <= 29 && (value as string).length >= 20 && (value as string).indexOf(" ") < 0 && "123456789".indexOf((value as string).substring(0, 1)) >= 0) // Date candidate
                        {
                            var result = Object.UnboxDates(value as any);
                            if (result != null && result["getTime"] != null) // is a date
                                return result;
                        }

                        // ByteArry
                        if (!String.IsNullOrWhiteSpace(value as string) && value.indexOf("base64,") == 0 && base64RegEx.test((value as string).substring(7)))
                        {
                            try
                            {
                                return Uint8Array["FromBase64"]((value as string).substring(7));
                            }
                            catch(ex)
                            {
                            }
                        }
                        else if ((value as string).length >= 8) // function
                        {
                           let  prefix = (value as string).substring(0, 8);

                            if (prefix === 'function')
                            {
                                return eval('(' + ReplaceEarlyBindingWithLateBinding(value) + ')');
                            }
                            if (prefix === '_PxEgEr_') // RegExp
                            {
                                return eval(value.slice(8));
                            }
                            if (prefix === '_NuFrRa_') // arrow function
                            {
                                return eval(ReplaceEarlyBindingWithLateBinding(value.slice(8)));
                            }
                
                            return value;
                        }                        
                    }

                    return value;
                };

                let result = typeof json != "string" && !(json as any instanceof String)
                             ? jsonResolver("", json)
                             : JSON.parse(json, jsonResolver);

                if (result == null) return result;

                let resultType = result.GetType();

                if (resultType.IsPrimitive && resultType.Name != "Object")
                    return result;

                if (!resultType.IsPrimitive)
                    return result;

                if (targetType == null)
                {
                    if (result != null && !String.IsNullOrWhiteSpace(result["$type"]))                    
                        targetType = GetTypeFromHint(result["$type"]);

                    if (resultType.Name == "Object" && targetType != null && targetType.Name != "Object")
                        result = ObjectToClass(result, targetType) as T;                    
                }

                return result;
            }

            function ReplaceEarlyBindingWithLateBinding(functionBody: string | String): string | null
            {
                if (functionBody == null) return null;

                const regex = /(?<=^|\s|=>|;|=)\s*new\s+([a-zA-Z][a-zA-Z0-9._]*)\s*\(/g;

                var hasReplaced = false;
                var result = functionBody.replace(regex, (match, p1) =>
                {
                    let topLevelType = match.trim().split(" ")[1].split("(")[0].trim().split(".")[0];

                    if (self[topLevelType] == null) // top level type is not in scope, therefore need to do a late binding operation
                    {
                        hasReplaced = true;
                        return `self.Accelatrix.Type.CreateNewInstance('${p1}',[`;
                    }
                });

                if (!hasReplaced) return functionBody.toString();

                const regex2 = /(self\.Accelatrix\.Type\.CreateNewInstance[^)]*)\)/g;
                result = result.replace(regex2, '$1])');

                return result;
            }

            function GetTypeFromHint(typeName: string)
            {
                let candidates = Accelatrix["Type"].FromName(typeName) as Array<Accelatrix_Type.Type>;

                if (candidates == null || candidates.length == 0)
                   throw new Accelatrix_Type.Type.TypeNotFoundException(typeName);
                
                if (candidates.length != 1)
                   throw new Accelatrix_Type.Type.AmbiguousTypeException(typeName);

                return candidates[0];                
            }

            function GetPropertyType(type: Accelatrix_Type.Type, propertyName: string)
            {
                if (type == null || String.IsNullOrWhiteSpace(propertyName))
                    return null;

                let typeCandidates = type.GetProperties().map(z => ({ Name: z.Name, Type: z.Type}))
                                                .concat(type.GetFields().map(z => ({ Name: z.Name, Type: z.Type})))
                                                .filter(z => z.Name == propertyName)
                                                .map(z => z.Type)
                                                .filter(z => z != null);
                                                
                return typeCandidates.length == 0 ? null : typeCandidates[0];
            }

            function FillInstance(target: object, from: object, aliases: object)
            {
                if (from == null || target == null) return;

                Object.keys(from)
                      .filter(z => z != "$type")
                      .filter(z => from[z] != null)
                      .forEach(z =>
                              {
                                  let mappedAlias = aliases == null || aliases[z] == null
                                                    ? z
                                                    : aliases[z];

                                  let isNull = target[mappedAlias] == null;
                                  try
                                  {
                                    let result = from[z];
                                    target[mappedAlias] = result;
                                  }
                                  catch(ex)
                                  {

                                  }
                                  finally
                                  {
                                      if (target[mappedAlias] == null)
                                        try
                                        {
                                            let result = from[z];
                                            Object.defineProperty(target, mappedAlias, { get: () => result, enumerable: true });
                                        }
                                        catch(ex)
                                        {
                                            console.warn("Could not set the value of member '" + mappedAlias + "' in object of type '" + target.GetType().GetFullName() + "'. For better results, please include a parameter with the same name in the construtor, or ensure that the property with the same name is set as configurable: true.")
                                        }  
                                  }                                  
                              });
            }

            function ObjectToClass(obj: any, type: Accelatrix_Type.Type)
            {
                if (type.IsOfType(Accelatrix_Enumerable.Collections.Enumerable))
                    return ObjectToEnumerable(obj, type);

                let newValue: any;

                try
                {
                    newValue = type.CreateNewInstance(obj);
                }
                catch(ex)
                {
                    newValue = obj;
                }

                let knownType = GetKnownType(type);

                if (knownType != null && knownType.OnDeserializing != null)
                {
                    var func = knownType.OnDeserializing
                    func = func.bind(newValue);
                    func();
                }

                try
                {         
                    let aliases = {};

                    if (knownType != null && knownType.DataMembers != null)
                        Object.keys(knownType.DataMembers)
                              .Where(x => !String.IsNullOrWhiteSpace(knownType.DataMembers[x].Alias))
                              .ForEach(x => aliases[x] = knownType.DataMembers[x].Alias);

                    FillInstance(newValue, obj, aliases);
                }
                catch(ex)
                {
                    newValue = obj;
                }

                if (knownType != null && knownType.OnDeserialized != null)
                {
                    var func = knownType.OnDeserialized;
                    func = func.bind(newValue);
                    func();
                }

                return newValue;
            }

            function ObjectToEnumerable(obj: any, enumerableType: Accelatrix_Type.Type,)
            {
                let members = obj["Members"] as Array<any>;

                let firstMember = members[0].Op;

                if (firstMember instanceof Function)
                    firstMember = firstMember.apply(null, members[0].Args);

                var result = firstMember == null
                             ? enumerableType.CreateNewInstance([members[0]])
                             : enumerableType.CreateNewInstance([firstMember]);

                members.Skip(1)
                       .ForEach(z => result = result[z.Op].apply(result, z.Args));

                var key = obj.Key;
                if (key != null)
                    Object.defineProperty(result, "Key", { get: () => key, enumerable: true });

                return result;
            }

            export function Stringify(obj: any)
            {
                var pendingSerialized: Function | null = null;

                var result = JSON.stringify(obj, function(key, value)
                {                          
                    if (pendingSerialized != null)
                    {
                        pendingSerialized();
                        pendingSerialized = null;
                    }                   

                    if (typeof value == "string") return value; // faster
                    if (typeof value == "number") return value; // faster
                    if (typeof value == "boolean") return value; // faster
                    if (value instanceof Date) return value; // faster

                    if (value != null && value instanceof Error && value["$type"] == null)
                    {
                        value = new Accelatrix["Exception"](!String.IsNullOrWhiteSpace(value.stack) ? value.stack : value.message);
                        value["stack"] = value.stack;
                    }                        

                    let isFunction = value instanceof Function || typeof value === 'function';
                    let isObject = !isFunction && value != null && value instanceof Object;
                    let objectType = !isObject ? null : value.GetType();
                    let objectKnownType = GetKnownType(objectType);

                    if (isObject)
                        HandleDataMembersOnSerialization(value, objectKnownType);                   

                    if (objectKnownType != null && objectKnownType.OnSerializing != null)
                    {
                        var func = objectKnownType.OnSerializing;
                        func = func.bind(value);
                        func();
                    }

                    if (objectKnownType != null && objectKnownType.OnSerialized != null)
                    {
                        var func = objectKnownType.OnSerialized 
                        func = func.bind(value);
                        pendingSerialized = func;
                    }

                    if (isObject && String.IsNullOrWhiteSpace(value["$type"]))
                    {
                        if (!objectType.IsArray)
                        {
                            let typeName = value.GetType().GetFullName();

                            if (typeName == "Object")
                                return value;

                            let newObj = {
                                            $type: typeName,
                                           ...value
                                         };

                          return newObj;   
                        }
                        else if (objectType.Name == "Uint8Array")
                        {
                            return "base64," + (value as Uint8Array)["ToBase64"]();
                        }
                        else if (value.Key != null)
                        {
                            var myKey = value.Key;
                            return {
                                        $type: "Accelatrix.Collections.Enumerable",
                                        Key: myKey,
                                        Members: [ (value as Array<any>).slice(0, value.length) ],
                                   };
                        }
                    }
                    else if (isFunction)
                    {
                        let fnBody = value.toString();
        
                        if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function')
                        {
                            //this is ES6 Arrow Function
                            return '_NuFrRa_' + fnBody;
                        }
                        return fnBody;
                    }
                    else if (value instanceof RegExp)
                    {
                        return '_PxEgEr_' + value;
                    }

                    return value;
                });

                if (pendingSerialized != null)
                {
                    pendingSerialized();
                    pendingSerialized = null;
                }

                return result;
            }

            export function RegisterKnownType(type: Accelatrix_Type.Type | { new (...args: any[]): {} }, alias?: string): IKnownTypeRegistration
            {               
                var entry: IKnownTypeRegistration | null = null;

                for (var i = 0; i < knownTypes.length; i++)
                {
                    if (knownTypes[i].OriginalRegistration == type)
                    {
                        entry = knownTypes[i];
                        break;
                    }
                }

                if (entry == null)
                {
                    entry = {
                                OriginalRegistration: type,
                                OnSerializing: null,
                                OnSerialized: null,
                                OnDeserializing: null,
                                OnDeserialized: null,
                                DataMembers: {}
                            } as any as IKnownTypeRegistration;

                    var resolvedType = type;
                    Object.defineProperty(entry, "Type",
                    {
                       get: () =>
                            {
                                if (!(resolvedType instanceof Function))
                                    return resolvedType;

                                resolvedType = Accelatrix["Type"].FromConstructor(type as { new (...args: any[]): {} }, alias);
                                return resolvedType;
                            }
                    });


                    var resolvedDataMembers = null;
                    Object.defineProperty(entry, "ResolvedDataMembers",
                    {
                        get: () =>
                        {
                            if (resolvedDataMembers == null && entry != null)
                                resolvedDataMembers = GetDataMembers(entry.Type) as any;

                            return resolvedDataMembers;
                        }
                    });

                    knownTypes.push(entry);
                }

                return entry;
            }

            function GetKnownType(type: Accelatrix_Type.Type): IKnownTypeRegistration
            {             
                if (type == null) return null as any;

                let entry: IKnownTypeRegistration = null;

                for (var i = 0; i < knownTypes.length; i++)
                {
                    if (knownTypes[i].Type == type)
                    {
                        entry = knownTypes[i];
                        break;
                    }
                }

                return entry;
            }

            export function EnrichKnownType(target: Object, onSerializing?: Function | undefined | null, onSerialized?: Function | undefined | null, onDeserializing?: Function | undefined | null, onDeserialized?: Function | undefined | null, dataMember?: { propertyKey: string, include?: boolean, alias?: string } | undefined | null ): IKnownTypeRegistration
            {
                let constructor = target == null
                                  ? target
                                  : target.constructor;

                if (constructor == null)
                    return null as any;
                    
                let entry = RegisterKnownType(constructor as any);

                if (onSerializing != null) entry.OnSerializing = onSerializing;
                if (onSerialized != null) entry.OnSerialized = onSerialized;
                if (onDeserializing != null) entry.OnDeserializing = onDeserializing;
                if (onDeserialized != null) entry.OnDeserialized = onDeserialized;
                if (dataMember != null)
                    entry.DataMembers[dataMember.propertyKey] = { Include: dataMember.include == null || dataMember.include === true, Alias: dataMember.alias };

                return entry;
            }

            function GetDataMembers(type: Accelatrix_Type.Type): { [id: string] : { Type: Accelatrix_Type.Type, Include: boolean, Alias?: string} } 
            {
                var result: { [id: string] : { Type: Accelatrix_Type.Type, Include: boolean, Alias?: string} } = {} ;

                if (type == null) return result;

                let myType = type;

                while (myType != null)
                {
                    let forMe = GetKnownType(myType);

                    if (forMe != null)
                    {
                        Object.keys(forMe.DataMembers)
                              .filter(z => result[z] == null)
                              .forEach(z => result[z] = { Type: myType, Include: forMe.DataMembers[z].Include, Alias: forMe.DataMembers[z].Alias });
                    }

                    myType = myType.BaseType;
                }

                return result;
            }

            function HandleDataMembersOnSerialization(obj: Object, knownType: IKnownTypeRegistration)
            {
                if (knownType == null) return;

                let dataMembers = knownType.ResolvedDataMembers;                                

                if (dataMembers == null || Object.keys(dataMembers).length == 0) return;

                Object.keys(dataMembers)
                      .map(z => ({ MemberName: z, Include: dataMembers[z].Include, Alias: dataMembers[z].Alias, Type: dataMembers[z].Type }))
                      .forEach(z =>
                      {                            
                            let target = obj;
                            let desc = Object.getOwnPropertyDescriptor(target, z.MemberName);
                            let inherited = false;
                            
                            if (desc == null) // not mine: inherited
                            {
                                inherited = true;
                                target = z.Type.GetConstructor().prototype;
                                desc = Object.getOwnPropertyDescriptor(target, z.MemberName);
                            }
                            
                            if (desc == null) return;

                            if (desc.get != null)
                            {
                                if (!inherited && desc.enumerable && z.Include)
                                {
                                    // already included
                                }
                                else if (inherited && !z.Include)
                                {
                                    // already excluded
                                }
                                else
                                {
                                    var newGetter = desc.get;
                                    newGetter.bind(obj);
                                    Object.defineProperty(obj, String.IsNullOrWhiteSpace(z.Alias) ? z.MemberName : z.Alias as string, { get: newGetter, enumerable: z.Include });
                                }
                            }
                            else if (desc.value != null) // base field
                            {
                                if (!inherited && desc.enumerable && z.Include)
                                {
                                    // already included
                                }
                                else if (z.Include != desc.enumerable)
                                    Object.defineProperty(obj, String.IsNullOrWhiteSpace(z.Alias) ? z.MemberName : z.Alias as string, { value: desc.value, enumerable: z.Include });
                            }
                       });
            }
        }

        interface IKnownTypeRegistration
        { 
            OriginalRegistration: Accelatrix_Type.Type | { new (...args: any[]): {} };
            Type: Accelatrix_Type.Type;
            OnSerializing: Function;
            OnSerialized: Function;
            OnDeserializing: Function;
            OnDeserialized: Function;
            DataMembers: { [id: string] : { Include: boolean, Alias?: string } };
            ResolvedDataMembers?:  { [id: string] : { Type: Accelatrix_Type.Type, Include: boolean, Alias?: string} } ;
        }
    }
    
    declare namespace Accelatrix
    {
        class ArgumentNullException
        {
            public constructor(message: string, argumentName?: string);
        }

        class ArgumentException
        {
            public constructor(message: string, argumentName?: string);
        }     
    }
    
    declare interface ObjectConstructor extends Object
    {
        FlattenHierarchy<T>(obj: Object, childEnumerator: (item: T) => Accelatrix_Enumerable.Collections.IEnumerableOps<T>): Accelatrix_Enumerable.Collections.IEnumerableOps<T>;
    }  
}
