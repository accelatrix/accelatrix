/// <reference path="./Base.ts" />
/// <reference path="./String.ts" />

declare global
{
    export interface Object
    {
        /** Gets the type of object, e.g. "String", "Date", "Boolean".*/
        GetType(): Accelatrix.Type;   
    }
}

/** Accelatrix namespace. */
export namespace Accelatrix
{     

    //#region Entities in same namespace in other files, but herein consumed

    declare namespace Accelatrix
    {
        abstract class Exception extends Error
        {
            public constructor(message: string);
        }

        class ArgumentNullException
        {
            public constructor(message: string, argumentName?: string);
        }

        class ArgumentException
        {
            public constructor(message: string, argumentName?: string);
        }

        function ImmutableObject<T extends { new (...args: any[]): {} }>(constructor: T): T;
    }

    //#endregion    

    /** The generic representation of a type.*/
    export abstract class Type
    {
        // #region Constructor

        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         */
        protected constructor(constructor: Function)
        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         * @param sampleInstance An instance of the object to infer additional metadata from.
         */
        protected constructor(constructor: Function, sampleInstance: any)
        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         * @param sampleInstance An instance of the object to infer additional metadata from.
         * @param namespace The complete hierarchy of objects to get to the type.
         */
        protected constructor(constructor: Function, sampleInstance: any, namespace: string)
        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         * @param sampleInstance An instance of the object to infer additional metadata from.
         * @param namespace The complete hierarchy of objects to get to the type.
         */
        protected constructor(constructor: Function, sampleInstance?: any, namespace?: string)
        {
            if (constructor == null)
                throw new Accelatrix.ArgumentNullException("constructor");

            if (!(constructor instanceof Function))
                throw new Accelatrix.ArgumentException("constructor");

            let entry = { Constructor: constructor, Type: this, SampleInstance: sampleInstance, Namespace: namespace };

            LazyGetter(() => constructor, this, "GetConstructor", true);

            TypeSystem.RegisterType(entry);
        }

        // #endregion

        // #region Properties

        /** Gets if the type corresponds to a JavaScript primitive type, e.g. String, Boolean, etc. */
        public get IsPrimitive(): boolean
        {
            return false;
        }

        /** Gets if the type corresponds to an Enum. */
        public get IsEnum(): boolean
        {
            return false;
        }

        /** Gets if the type corresponds to an Array. */
        public get IsArray(): boolean
        {
            return this == TypeSystem.LoadedTypes()[4].Type
                   || this == TypeSystem.LoadedTypes()[5].Type
                   || this == TypeSystem.LoadedTypes()[6].Type;
        }

        /** Gets if the type corresponds to a Class. */
        public get IsClass(): boolean
        {
            return !this.IsPrimitive && !this.IsArray && !this.IsEnum;
        }

        /** Gets if the type corresponds to a Function. */
        public get IsFunction(): boolean
        {
            return this == TypeSystem.LoadedTypes()[8].Type;
        }

        /** Gets the name of the type. */
        public get Name(): string
        {
            return this.GetConstructor()["name"] == null
                   ? "(anonymous)"
                   : this.GetConstructor()["name"];
        }

        /** Gets the given name for the type by external consumers, e.g. the value of property $type used during JSON serialisation. */
        public get Alias(): string
        {
            return LazyGetter(() => TypeSystem.GetAlias(this), this, "Alias", false, false);
        }      

        /** Gets the type of the current type inherits from. */
        public get BaseType(): Type
        {
            return this.IsPrimitive
                   ? null
                   : LazyGetter(() => TypeSystem.GetTypeForConstructor(this.GetConstructor()["__proto__"], this), this, "BaseType", false, true);
        }
        
        /** Gets all types loaded into the Type system. */
        public static get LoadedTypes(): Array<Type>
        {            
            return TypeSystem.LoadedTypes().map(z => z.Type);
        }

        /** Gets the String type. */
        public static get String(): Type
        {
            return TypeSystem.LoadedTypes()[0].Type;
        }

        /** Gets the Number type. */
        public static get Number(): Type
        {
            return TypeSystem.LoadedTypes()[1].Type;
        }

        /** Gets the Bolean type. */
        public static get Boolean(): Type
        {
            return TypeSystem.LoadedTypes()[2].Type;
        }

        /** Gets the Date type. */
        public static get Date(): Type
        {
            return TypeSystem.LoadedTypes()[3].Type;
        }

        /** Gets the Array type. */
        public static get Array(): Type
        {
            return TypeSystem.LoadedTypes()[4].Type;
        }

        /** Gets the ByteArray type. */
        public static get ByteArray(): Type
        {
            return TypeSystem.LoadedTypes()[6].Type;
        }

        /** Gets the Object type. */
        public static get Object(): Type
        {
            return TypeSystem.LoadedTypes()[7].Type;
        }

        /** Gets the Function type. */
        public static get Function(): Type
        {
            return TypeSystem.LoadedTypes()[8].Type;
        }

        // #endregion

        // #region Methods

        /** Gets the function that build a new instance of the type. */
        public GetConstructor<T extends { new (...args: any[]): {} }>(): T
        {
            return null;
        }

        /** The name with namespace (when one could be obtained). */
        public GetFullName(): string
        {
            let result = LazyGetter(() => TypeSystem.GetNamespace(this), this, "GetFullName", true, false);

            return result == null
                   ? this.Name
                   : result;
        }

        /** Gets all properties (not fields/members) of the type. */
        public GetProperties() : Array<{  /** The name of the property. */
                                          Name: string,
                                          /** If the property is inherited. */
                                          Inherited: boolean,
                                          /** When possible to determine, the expected type of the property. */
                                          Type?: Type,
                                          /** When possible to determine, if the property has a setter. */
                                          IsReadonly?: boolean }>
        {
            return LazyGetter(() => TypeSystem.GetProperties(this), this, "GetProperties", true, true);
        }

        /** Gets all fields (not properties) of the type. */
        public GetFields() : Array<{ 
                                      /** The name of the field. */
                                      Name: string,
                                      /**hen possible to determine, the expected type of the property. */
                                      Type?: Type }>
        {
            return LazyGetter(() => TypeSystem.GetFields(this), this, "GetFields", true, false);
        }

        /** Creates a new instance from this type. */
        public CreateNewInstance():  object
        /**
         * Creates a new instance from this type.
         * @param constructorArgs The arguments to pass to the constructor, either as an ordered collection, or as a named collection.
         */
        public CreateNewInstance(constructorArgs: Array<any> | object):  object
        /**
         * Creates a new instance from this type.
         * @param constructorArgs The arguments to pass to the constructor, either as an ordered collection, or as a named collection.
         * @returns Returns a new object instance instantiated from the type.
         */
        public CreateNewInstance(constructorArgs?: Array<any> | object):  object
        {
            return TypeSystem.Instantiate(this, constructorArgs);
        }

        /**
         * Creates a new instance of a type based on its name.
         * @param typeName The name of the type.
         * @returns Returns an object of the specified type.
         */
        public static CreateNewInstance(typeName: string): object
        /**
         * Creates a new instance of a type based on its name.
         * @param typeName The name of the type.
         * @param constructorArgs The arguments to pass to the constructor, either as an ordered collection, or as a named collection.
         * @returns Returns an object of the specified type.
         */        
        public static CreateNewInstance(typeName: string, constructorArgs: Array<any> | object): object
        /**
         * Creates a new instance of a type based on its name.
         * @param typeName The name of the type.
         * @param constructorArgs The arguments to pass to the constructor, either as an ordered collection, or as a named collection.
         * @returns Returns an object of the specified type.
         */
        public static CreateNewInstance(typeName: string, constructorArgs?: Array<any> | object): object
        {
            if (String.IsNullOrWhiteSpace(typeName)) throw new Accelatrix.ArgumentNullException("typeName");

            let myType = Type.FromName(typeName) as Array<Type>;
                
            if (myType == null || myType.length == 0)
            {
                let isWebWorker = self["__WebWorkerNestingLevel__"] != null;

                if (!isWebWorker)
                    throw new Type.TypeNotFoundException(typeName);
                else
                    throw new Type.TypeNotFoundException(typeName, "Type '" + typeName + "' is not available in the Web Workers environment.\nPlease use Accelatrix.Tasks.Config.Scripts to pass the necessary script or code block where the type is present.");
            }                

            if (myType.length != 1)
                throw new Type.AmbiguousTypeException(typeName, null, myType);

            return myType[0].CreateNewInstance(constructorArgs);
        }

        /**
         * Indicates if the specified type is the same or a parent from the current type.
         * @param type The type to compare or its name.
         */        
        public IsOfType<T extends { new (...args: any[]): {} }>(type: Type | T | string)
        {
            if (type == null) return false;
            if (this == type) return true;
            if (this.GetConstructor() == type) return true;

            // check if a Type was passed or a constructor
            if ((type as Type).IsPrimitive == null && type instanceof Function && type["name"] != null)
            {
                type = TypeSystem.GetTypeForConstructor(type as T);
                if (this == type) return true;
            }
            else if (type instanceof String || typeof type == "string") // check for type name
            {
                if (String.IsNullOrWhiteSpace(type as string))
                    throw new Accelatrix.ArgumentNullException("type");

                let types = Type.FromName(type.toString());
                
                if (types == null || types.length == 0)
                    throw new Type.TypeNotFoundException(type.toString());

                if (types.length > 1)
                    throw new Type.AmbiguousTypeException(type.toString(), null, types);

                type = types[0];
            }

            return type == null ? false : (type as Type).IsAssignableFrom(this);
        }

        /**
         * Indicates if the specified type is the same or a descendant from the current type.
         * @param type The type to compare or its name.
         */
        public IsAssignableFrom<T extends { new (...args: any[]): {} }>(type: Type | T | string)
        {
            if (type == null) return false;
            if (this == type) return true;
            if (this.GetConstructor() == type) return true;

            // check if a Type was passed or a constructor
            if ((type as Type).IsPrimitive == null && type instanceof Function && type["name"] != null)
            {
                type = TypeSystem.GetTypeForConstructor(type as T);
                if (this == type) return true;
            }
            else if (type instanceof String || typeof type == "string") // check for type name
            {
                if (String.IsNullOrWhiteSpace(type as string))
                    throw new Accelatrix.ArgumentNullException("type");

                let types = Type.FromName(type.toString());
                
                if (types == null || types.length == 0)
                    throw new Type.TypeNotFoundException(type.toString());

                if (types.length > 1)
                    throw new Type.AmbiguousTypeException(type.toString(), null, types);

                type = types[0];
            }

            let currentType = type == null ? null : (type as Type).BaseType;

            while (currentType != null)
            {
                if (currentType == this)
                    return true;

                currentType = currentType.BaseType;
            }

            return false;
        }

        /** Gets the string representation of the Type. */
        public toString()
        {
            return this.GetFullName();
        }

        // GetMember, GetMembers, GetMethod, GetProperties

        // #endregion

        /**
         * Gets the Type of the supplied object's instance.
         * @param obj The instance of the object to probe.
         * @returns Returns the Type of the supplied object's instance.
         */
        public static FromInstance(obj: any): Type
        {
            if (obj == null)
                throw new Accelatrix.ArgumentNullException("object");

            if (obj.__proto__ == null)
                throw new Accelatrix.ArgumentException("Argument 'object' is not an object.", "object");

            return obj.hasOwnProperty == null || !obj.hasOwnProperty("GetType")
                   ? TypeSystem.GetTypeForConstructor(obj.__proto__.constructor, obj)
                   : obj.GetType();
        }


        /**
         * Gets the Type of the supplied object's constructor.
         * @param constructor The constructor.
         * @returns Returns the corresponding Type.
         */
        public static FromConstructor(constructor: { new (...args: any[]): any }): Type
        /**
         * Gets the Type of the supplied object's constructor.
         * @param constructor The constructor.
         * @param alias The alias of the type, which should include namespace information, e.g. Bio.Mamal.Dog.
         * @returns Returns the corresponding Type.
         */        
        public static FromConstructor(constructor: { new (...args: any[]): any }, alias: string): Type
        /**
         * Gets the Type of the supplied object's constructor.
         * @param constructor The constructor.
         * @param alias The alias of the type, which should include namespace information, e.g. Bio.Mamal.Dog.
         * @returns Returns the corresponding Type.
         */        
        public static FromConstructor(constructor: { new (...args: any[]): any }, alias?: string): Type
        {
            if (constructor == null) throw new Accelatrix.ArgumentNullException("constructor");

            return TypeSystem.GetTypeForConstructor(constructor, undefined, alias);
        }

        /**
         * Gets all Types that match a specified name ordered by best match.
         * @param typeName The name of the type to retrieve.
         * @returns Returns all Types that match a specified name ordered by best match.
         */
        public static FromName(typeName: string): Array<Type>
        {
            return TypeSystem.GetTypesFromName(typeName);
        }

        //#endregion Exceptions

        /** An exception pertaining to types. */
        public static TypeException = class TypeException extends Accelatrix.Exception
        {
            /**
             * Creates a new TypeException.
             * @param typeName The name of the type.
             */
            public constructor(typeName: string)
            /**
             * Creates a new TypeException.
             * @param typeName The name of the type.
             * @param message A custom message.
             */
            public constructor(typeName: string, message: string)
            /**
             * Creates a new TypeException.
             * @param typeName The name of the type.
             * @param message A custom message.
             */
            public constructor(typeName: string, message?: string)
            {
                if (String.IsNullOrWhiteSpace(typeName))
                    throw new Accelatrix.ArgumentNullException("typeName");

                let msg = String.IsNullOrWhiteSpace(message)
                          ? "Type '" + typeName + "' could not be found or is ambiguous."
                          : message;

                super(msg);

                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Type.TypeException"});
                Object.defineProperty(this, "TypeName", { get: () => message, enumerable: true });
            }

            /** Gets the name of the type. */
            public get TypeName(): string
            {
                return null;
            }
        }

        /** An exception describing when a given type could not be found. */
        public static TypeNotFoundException = class TypeNotFoundException extends Type.TypeException
        {
            /**
             * Creates a new TypeNotFoundException.
             * @param typeName The name of the type.
             */
            public constructor(typeName: string)
            /**
             * Creates a new TypeNotFoundException.
             * @param typeName The name of the type.
             * @param message A custom message.
             */
            public constructor(typeName: string, message: string)
            /**
             * Creates a new TypeNotFoundException.
             * @param typeName The name of the type.
             * @param message A custom message.
             */
            public constructor(typeName: string, message?: string)
            {
                let msg = String.IsNullOrWhiteSpace(message)
                          ? "Type '" + typeName + "' could not be found."
                          : message;

                super(typeName, msg);

                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Type.TypeNotFoundException"});
            }        
        }

        /** An exception describing when a given type is not unique. */
        public static AmbiguousTypeException = class AmbiguousTypeException extends Type.TypeException
        {
            /**
             * Creates a new AmbiguousTypeException.
             * @param typeName The name of the type.
             */
            public constructor(typeName: string)
            /**
             * Creates a new AmbiguousTypeException.
             * @param typeName The name of the type.
             * @param message A custom message.
             */
            public constructor(typeName: string, message: string)
            /**
             * Creates a new AmbiguousTypeException.
             * @param typeName The name of the type.
             * @param message A custom message.
             * @param otherTypes The other types that match the same criteria.
             */
            public constructor(typeName: string, message: string, otherTypes: Array<Type>)            
            /**
             * Creates a new AmbiguousTypeException.
             * @param typeName The name of the type.
             * @param message A custom message.
             * @param otherTypes The other types that match the same criteria.
             */
            public constructor(typeName: string, message?: string, otherTypes?: Array<Type>)
            {
                let msg = !String.IsNullOrWhiteSpace(message)
                          ? message
                          : otherTypes == null || otherTypes.length == 0
                             ? "Type '" + typeName + "' is not unique."
                             : "Type '" + typeName + "' is not unique.\nSibling types include \n" + otherTypes.map(z => z.GetFullName()).join(", ")

                super(typeName, msg);

                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Type.AmbiguousTypeException"});
            }
        }

        /** An exception describing when a given type is not of the expected subtype. */
        public static SubTypeMismatchException = class SubTypeMismatchException extends Type.TypeException
        {
            /**
             * Creates a new SubTypeMismatchException.
             * @param superType The super type.
             * @param subType The subType.
             */
            public constructor(superType: Type, subType: Type)
            {
                if (superType == null) throw new Accelatrix.ArgumentNullException("superType");
                if (subType == null) throw new Accelatrix.ArgumentNullException("subType");

                let msg = "Type '" + superType.GetFullName() + "' is not assignable from type '" + subType.GetFullName() + "'."

                super(superType.GetFullName(), msg);

                Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Type.SubTypeMismatchException"});
                Object.defineProperty(this, "SubTypeName", { get: () => subType.GetFullName(), enumerable: true });                
            }

            /** Gets the name of the subtype. */
            public get SubTypeName(): string
            {
                return null;
            }            
        }          

        //#endregion
    }

    class ClassType extends Type
    {
        public constructor(constructor: Function, sampleInstance?: any, namespace?: string)
        {
            super(constructor, sampleInstance, namespace);
        }      
    }

    class EnumType extends Type
    {
        public constructor(constructor: Function, sampleInstance?: any, namespace?: string)
        {
            super(constructor, sampleInstance, namespace);

            Object.defineProperty(sampleInstance, "GetType", { value: () => this, writable: true } );
        }
        
        /** Gets if the type corresponds to an Enum. */
        public get IsEnum(): boolean
        {
            return true;
        }      
    }

    class PrimitiveType extends Type
    {
        public constructor(constructor: Function)
        {
            super(constructor, null, null);
        }

        /** Gets if the type corresponds to a JavaScript primitive type, e.g. String, Boolean, etc. */
        public get IsPrimitive(): boolean
        {
            return true;
        }
    }

    function LazyGetter<T>(builder: () => T, instance: object, methodName: string, isMethod?: boolean, acceptNullAsResolved?: boolean)
    {
        var result = builder();

        if (result == null && acceptNullAsResolved !== true)
            return result;

        if (isMethod)
            Object.defineProperty(instance, methodName, { value: () => result, writable: false });
        else
            Object.defineProperty(instance, methodName, { get: () => result });

        return result;
    }

    module TypeSystem
    {
        var loadingTypes = false;
        var hasFullscanned = false;
        const loadedTypes : Array<{ Constructor: Function, Type: Type, SampleInstance: object, Namespace: string }> = [];
        const resolvedTypeNames:  { [key: string]: Array<Type> }  = {};

        export function ScanTypes(reScanFrom?: any, exclude?: any)
        {
            let tryReadProto = (obj: object) =>
                               {
                                  try
                                  {
                                    return obj != null && obj["__proto__"] != null;
                                  }
                                  catch(e)
                                  {
                                    return false;
                                  }
                               };

            let typeScanner = (root: any, namespace: string, onlyProto: boolean) => (root == exclude ? [] : Object.keys(root))
                                                                                          .map(z =>
                                                                                           {
                                                                                                try
                                                                                                {
                                                                                                    return ({ Name: z, Value: root[z]});
                                                                                                }
                                                                                                catch(ex)
                                                                                                {}
                                                                                           })
                                                                                          .filter(z => z != null && z.Value != null && root != z.Value && z.Value != self) // circular references
                                                                                          .filter(z => !onlyProto || tryReadProto(z.Value))
                                                                                          .filter(z => z.Value == null || z.Value.jquery == null) // defend against JQuery
                                                                                          .filter(z => !ValueIsOfPrimitiveType(z.Value) || z.Value instanceof Function || z.Value instanceof Array)
                                                                                          .forEach(z =>
                                                                                          {
                                                                                                if (!(z.Value instanceof Function))
                                                                                                {
                                                                                                    if (IsEnum(z.Value))
                                                                                                    {
                                                                                                        // this registers it
                                                                                                        let syntheticConstructor = () => z.Value;

                                                                                                        Object.defineProperty(syntheticConstructor, "name", { value: z.Name });

                                                                                                        new EnumType(syntheticConstructor,
                                                                                                                     z.Value,
                                                                                                                     String.IsNullOrWhiteSpace(namespace) ? z.Name : namespace + "." + z.Name);                                                                                                        
                                                                                                    }
                                                                                                    else
                                                                                                        typeScanner(z.Value,
                                                                                                                    String.IsNullOrWhiteSpace(namespace) ? z.Name : namespace + "." + z.Name,
                                                                                                                    false);
                                                                                                }
                                                                                                else if (z.Value["name"] != null && z.Value["name"].length > 0 && z.Value.toString().indexOf("[native code]") < 0 && z.Value.prototype != null && z.Value.prototype.constructor != null)
                                                                                                {
                                                                                                    // try guessing if it is the constructor of a class
                                                                                                    let isClassConstructor: boolean = null;
                                                                                                    let constructor = z.Value.prototype.constructor;
                                                                                                    let constructorCode = constructor.toString() as string;                                                          

                                                                                                    // check if constructor contains bad terms
                                                                                                    const forbiddenTerms = [ "[native code]", "document.", "location.href", "window.", "$(" ];                                                                                                    

                                                                                                    if (forbiddenTerms.some(z => constructorCode.indexOf(z) >= 0))
                                                                                                        isClassConstructor = false;

                                                                                                    // check if construtor returns nothing
                                                                                                    if (isClassConstructor == null && constructorCode.indexOf("{") > 0)
                                                                                                    {
                                                                                                        let contents = constructorCode.substring(1 + constructorCode.indexOf("{"));
                                                                                                        contents = contents.substring(0, contents.lastIndexOf("}")).trim();

                                                                                                        if (contents.length == 0) // empty constructor
                                                                                                            isClassConstructor = true;
                                                                                                        else if (contents.indexOf("Object.defineProperty(this") >= 0)
                                                                                                            isClassConstructor = true;
                                                                                                        else if (contents.indexOf(";") > 0)
                                                                                                        {
                                                                                                            // check if construtor ends with returning itself
                                                                                                            contents = contents.split(";").reverse().filter(z => z.trim().length > 0)[0].trim();

                                                                                                            if (contents.indexOf("return ") >= 0 && contents.indexOf("this") > 0 && contents.trim().split(" ").length == 2)
                                                                                                                isClassConstructor = true;
                                                                                                            else if (contents.trim().indexOf("return ") < 0 && contents.indexOf("this.") >= 0) // class that only sets itself
                                                                                                                isClassConstructor = true;
                                                                                                        }
                                                                                                    }

                                                                                                    // check if constructor inherits from another
                                                                                                    if (isClassConstructor == null && constructor.__proto__ instanceof Function)
                                                                                                    {
                                                                                                        isClassConstructor = true;
                                                                                                    }

                                                                                                    if (isClassConstructor === true)
                                                                                                    {
                                                                                                        let result = null;

                                                                                                        try // try creating an instance of the class for additional introspection
                                                                                                        {                                                                                                     
                                                                                                            result = new constructor('1', '1', '1', '1', '1', '1', '1', '1', '1', '1'); // execute constructor as class and pass parameters

                                                                                                            if (result == self) // defend against window/self
                                                                                                                result = null;                                                                                                                
                                                                                                        }
                                                                                                        catch(ex) // parameters are not compatible with the constructors implementation. Cannot assess further.
                                                                                                        {
                                                                                                        }
                                                                                                        
                                                                                                        if (constructor != null)
                                                                                                            GetTypeForConstructor(constructor, result, String.IsNullOrWhiteSpace(namespace) ? z.Name : namespace + "." + z.Name);                                                                                                                                                                                                                
                                                                                                    }


                                                                                                    // scan for nested types
                                                                                                    typeScanner(z.Value,
                                                                                                                String.IsNullOrWhiteSpace(namespace) ? z.Name : namespace + "." + z.Name,
                                                                                                                false);                                                                                                    
                                                                                                }
                                                                                          });            
            loadingTypes = true;

            // add primitives
            if (loadedTypes.length == 0)
            {
                new PrimitiveType(String);
                new PrimitiveType(Number);
                new PrimitiveType(Boolean);
                new PrimitiveType(Date);
                new PrimitiveType(Array);
                new PrimitiveType(ArrayBuffer.prototype.constructor);
                new PrimitiveType(Uint8Array.prototype.constructor);
                new PrimitiveType(Object);
                new PrimitiveType(Function);
                new PrimitiveType(RegExp);                  
                
                //___();
            }

            try
            {
                var rootNamespace = reScanFrom == Accelatrix ? "Accelatrix" : "";
                typeScanner(reScanFrom == null ? self : reScanFrom, rootNamespace, true);
            }
            catch(ex)
            {
                // circular
            }
            finally
            {
                loadingTypes = false;
            }
        }

        export function ValueIsOfPrimitiveType(value: any)
        {
            return value instanceof String
                     || typeof value === 'string'
                     || value instanceof Number
                     || typeof value === 'number'
                     || value instanceof Boolean
                     || typeof value === 'boolean'
                     || value instanceof Date
                     || typeof value === 'symbol'
                     || value instanceof RegExp
                     || value instanceof Array
                     || value instanceof Function
                     || typeof value === 'function'
                     || value instanceof ArrayBuffer
                     || value instanceof Uint16Array
                     || value instanceof Uint32Array
                     || value instanceof Uint8Array
                     || value instanceof Uint8ClampedArray;
        }

        export function RegisterType(typeRegistration: { Constructor: Function, Type: Type, SampleInstance: object, Namespace: string })
        {
            if (typeRegistration == null)
                throw new Accelatrix.ArgumentNullException("typeRegistration");

            let existingEntry = null;

            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Constructor == typeRegistration.Constructor)
                {
                    existingEntry = loadedTypes[i];
                    break;
                }

            if (existingEntry == null)
                loadedTypes.push(typeRegistration);
            else
            {
                if (existingEntry.SampleInstance == null && typeRegistration.SampleInstance != null)
                    existingEntry.SampleInstance = typeRegistration.SampleInstance;

                if (existingEntry.Namespace == null && typeRegistration.Namespace != null)
                    existingEntry.Namespace = typeRegistration.Namespace;                
            }

            DropResolvedType(typeRegistration.Type);
        }

        export function GetTypeForConstructor<T extends { new (...args: any[]): {} }>(constructor: T, referenceInstance?: any, namespace?: string): Type
        {
            if (loadedTypes.length == 0 && !loadingTypes)
                ScanTypes(Accelatrix);

            var isObjectConstructor = constructor == loadedTypes[7].Constructor;

            if (isObjectConstructor)
            {
                if (referenceInstance != null && referenceInstance["$type"] != null)
                {
                    for (var i = 10; i < loadedTypes.length; i++)
                        if (loadedTypes[i].Type.GetFullName() == referenceInstance["$type"])
                        {
                            if (loadedTypes[i].Namespace == null && namespace != null)
                                loadedTypes[i].Namespace = namespace;
        
                            if (loadedTypes[i].SampleInstance == null && referenceInstance != null)
                                loadedTypes[i].SampleInstance = referenceInstance;
        
                            return loadedTypes[i].Type;
                        }
                }
                else
                    return loadedTypes[7].Type // object type
            }

            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Constructor == constructor)
                {
                    if (i > 9 && loadedTypes[i].Namespace == null && namespace != null)
                        loadedTypes[i].Namespace = namespace;

                    if (i > 9 && loadedTypes[i].SampleInstance == null && referenceInstance != null)
                        loadedTypes[i].SampleInstance = referenceInstance;                        

                    if (isObjectConstructor && referenceInstance["$type"] != null) // Object: find if the hint maps to an yet-to-be-kwnon type
                    {
                        var ctorCandidate: Function = null;

                        try
                        {
                             ctorCandidate = referenceInstance["$type"].indexOf(".") < 0
                                             ? self[referenceInstance["$type"]]
                                             : eval(referenceInstance["$type"].substring("(")[0]);
                        }
                        catch(ex)
                        {
                            return loadedTypes[i].Type
                        }

                        if (ctorCandidate == null)
                        {
                            let types = Type.FromName(referenceInstance["$type"]);
                
                            if (types == null || types.length == 0)
                                return loadedTypes[i].Type;
            
                            if (types.length > 1)
                                throw new Type.AmbiguousTypeException(referenceInstance["$type"], null, types);

                            return types[0];
                        }
                        else if (ctorCandidate instanceof Function && ctorCandidate.toString().indexOf("[native code]") < 0 && ctorCandidate.prototype != null && ctorCandidate.prototype.constructor != null)
                            return GetTypeForConstructor(ctorCandidate as any, referenceInstance, referenceInstance["$type"]);
                        else
                            return loadedTypes[i].Type;
                    }
                    else
                        return loadedTypes[i].Type;
                }

            var shouldFullscan = hasFullscanned || loadingTypes
                                 ? false
                                 : namespace == null
                                    ? true
                                    : namespace.indexOf("Accelatrix.") == 0 || namespace.indexOf("WebWorkerUtil.") == 0
                                        ? false
                                        : true;
                
            if (shouldFullscan)
            {
                hasFullscanned = true;
                ScanTypes(null, Accelatrix);
                return GetTypeForConstructor(constructor, referenceInstance, namespace);                
            }

            return String.IsNullOrWhiteSpace(constructor["name"])
                   ? loadedTypes[7].Type // object type
                   : new ClassType(constructor, referenceInstance, namespace);
        }

        export function IsEnum(obj: object)
        {
            if (obj == null || !(obj instanceof Object) || Object.keys(obj).length <= 1) return false;

            let safeComparison = (a, b) =>
                                 {
                                    try
                                    {
                                        return a == b;
                                    }
                                    catch(e)
                                    {}
                                 };

            if (Object.keys(obj).filter(z => safeComparison(obj[z], z)).length == Object.keys(obj).length) // keys and values are the same
                return true;

            try
            {
                if (Object.keys(obj)
                          .map(z => ({ Key: z, Value: obj[z].toString(), ValueAsKey: obj[obj[z].toString()].toString() }))
                          .filter(z => z.Key == z.ValueAsKey)
                          .length == Object.keys(obj).length)
                    return true;
            }
            catch(e)
            {

            }

            return false;
        }

        export function GetConstructor(type: Type)
        {
            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Type == type)
                    return loadedTypes[i].Constructor;
        }        

        export function GetAlias(type: Type)
        {
            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Type == type)
                {
                    return loadedTypes[i].SampleInstance == null
                           ? null
                           : loadedTypes[i].SampleInstance["$type"];
                }
        }

        export function GetNamespace(type: Type)
        {
            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Type == type)
                {
                    return loadedTypes[i].Namespace;
                }
        }

        export function GetProperties(type: Type)
        {
            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Type == type)
                {
                    let reflector = (prototype: Function, propertyName: string) => {
                                                                                        if (Object["getOwnPropertyDescriptor"] == null) // as this is ES2015
                                                                                            return null;

                                                                                        let descriptor = Object["getOwnPropertyDescriptor"](prototype, propertyName);

                                                                                        return { HasGetter: descriptor == null ? null : descriptor["get"] != null,  IsReadonly: descriptor != null && descriptor["set"] == null, IsEnumerable: descriptor != null && descriptor["enumerable"] === true};
                                                                                   }
                    // find properties
                    let myProperties = Object.getOwnPropertyNames(loadedTypes[i].Constructor.prototype)
                                             .filter(z => z != "constructor")
                                             .map(z => ({ Name: z, Reflected: reflector(loadedTypes[i].Constructor.prototype, z) }))
                                             .filter(z => z.Reflected == null || z.Reflected.HasGetter == null || z.Reflected.HasGetter === true);

                    let parentProperties = [];
                    let myType = type.BaseType;

                    while (myType != null && !myType.IsPrimitive)
                    {
                        let constructor: Function = null;

                        for(var j = 0; j < loadedTypes.length; j++)
                            if (loadedTypes[j].Type == myType)
                            {
                                constructor = loadedTypes[j].Constructor;
                                break;
                            }

                        Object.getOwnPropertyNames(constructor.prototype)
                              .filter(z => z != "constructor")
                              .map(z => ({ Name: z, Reflected: reflector(constructor.prototype, z) }))
                              .filter(z => z.Reflected == null || z.Reflected.HasGetter == null || z.Reflected.HasGetter === true)
                              .forEach(z => parentProperties.push(z));

                        myType = myType.BaseType;
                    }

                    let safeTypeGetter = (propName: string) =>
                                          {
                                                try
                                                {
                                                    let sampleValue = loadedTypes[i].SampleInstance == null ? null : loadedTypes[i].SampleInstance[propName];
                                                    return sampleValue == null ? null : sampleValue.GetType();
                                                }
                                                catch(ex)
                                                {
                                                    return null;
                                                }
                                          };

                    var allProperties = myProperties.map(z => z.Reflected == null
                                                                ? ({ Name: z.Name, Inherited: false, Type: safeTypeGetter(z.Name) })
                                                                : ({ Name: z.Name, Inherited: false, IsReadonly: z.Reflected.IsReadonly, Type: safeTypeGetter(z.Name) }))
                                                    .concat(parentProperties.map(z => z.Reflected == null
                                                                                        ? ({ Name: z.Name, Inherited: true, Type: safeTypeGetter(z.Name) })
                                                                                        : ({ Name: z.Name, Inherited: true, IsReadonly: z.Reflected.IsReadonly, Type: safeTypeGetter(z.Name) })));

                    return allProperties;
                }
        }        

        export function GetFields(type: Type)
        {
            let safeValueGetter = (obj: object, propName: string) =>
                                  {
                                      try
                                      {
                                         return obj[propName];
                                      }
                                      catch(ex)
                                      {
                                        return null;
                                      }
                                  };

            for(var i = 0; i < loadedTypes.length; i++)
                if (loadedTypes[i].Type == type)
                    return loadedTypes[i].SampleInstance == null
                           ? []
                           : Object.keys(loadedTypes[i].SampleInstance)
                                   .map(z => ({ Name: z, Value: safeValueGetter(loadedTypes[i].SampleInstance, z) }))
                                   .map(z => ({ Name: z.Name, Type: z.Value == null ? null : z.Value.GetType() }))
        }

        export function LoadedTypes()
        {
            if (loadedTypes == null || loadedTypes.length == 0)
                ScanTypes();

            return loadedTypes;
        }

        export function GetTypesFromName(typeName: string): Array<Type>
        {
            if (String.IsNullOrWhiteSpace(typeName))
                throw new Accelatrix.ArgumentNullException("typeName");

            if (resolvedTypeNames[typeName] != null)
            {
                var storedTypes = resolvedTypeNames[typeName];

                if (!storedTypes.Any())
                {
                     if (self[typeName] != null && typeof self[typeName] == "function")
                        storedTypes.push(Type.FromConstructor(self[typeName]));
                    else if (eval(self[typeName]) != null && typeof eval(self[typeName]) == "function")
                        storedTypes.push(Type.FromConstructor(eval(self[typeName])));
                }                    

                return storedTypes;
            }                

            LoadedTypes();

            let tier1 = loadedTypes.filter(z => z.Namespace != null && z.Namespace == typeName).map(z => z.Type);

            let result = [];

            // tier 1: high quality
            if (tier1.length == 1)
            {
                resolvedTypeNames[typeName] = tier1;
                return tier1;
            }

            let tier2 = loadedTypes.filter(z => z.Type.Alias != null && z.Type.Alias.indexOf(".") > 0 && z.Type.Alias == typeName).map(z => z.Type);

            // tier 2: high quality
            if (tier2.length == 1)
            {
                resolvedTypeNames[typeName] = tier2;
                return tier1;
            }

            let tier3 = loadedTypes.filter(z => z.Type.Name == typeName).map(z => z.Type);
            let tier4 = loadedTypes.filter(z => z.Type.Alias == typeName).map(z => z.Type).filter(z => typeName != "Object" ? z.Name != "Object" : true);

            // fuzzy
            tier1.concat(tier2).concat(tier3).concat(tier4).forEach(z =>
            {
                if (!result.some(w => w == z))
                    result.push(z);
            });

            // find without namespace
            if (result.length == 0 && typeName.indexOf(".") > 0)
            {
                var subname = typeName.split(".").reverse()[0];
                result = GetTypesFromName(subname);

                if (result.length == 1)
                {
                    for(var i = 0; i < loadedTypes.length; i++)
                        if (loadedTypes[i].Constructor == result[0].Constructor)
                        {
                            loadedTypes[i].Namespace = typeName;
                            break;
                        }    
                }
            }

            resolvedTypeNames[typeName] = result;

            return result;
        }

        function DropResolvedType(type: Type)
        {
            if (loadingTypes) return;

            Object.keys(resolvedTypeNames)
                  .filter(z => resolvedTypeNames[z] == null || resolvedTypeNames[z].length == 0 || resolvedTypeNames[z].some(w => w == type))
                  .forEach(z =>
                  {
                      delete resolvedTypeNames[z];
                  });
        }

        export function Instantiate(type: Type, constructorArgs?: Array<any> | object):  object
        {
            if (type == null) return {};

            if (type == loadedTypes[7].Type) return constructorArgs; // generic object

            let constructor = type.GetConstructor();
            if (constructorArgs == null) return new (constructor)();

            if (constructorArgs.GetType().IsArray)
                return new (constructor.bind.apply(constructor, [undefined].concat(constructorArgs as Array<any>) ))()

            let constructorExpectedArgNames = constructor["ConstructorArgs"] != null
                                              ? constructor["ConstructorArgs"] // from ImmutableObject
                                              : constructor.toString().substring(constructor.toString().indexOf("(") + 1, constructor.toString().indexOf(")")).trim().split(",").map(z => z.trim());

            if (constructorExpectedArgNames.length == 0)
                return new (constructor)();

            let tryObtainValue = (argName: string) => constructorArgs[argName] != null
                                                      ? constructorArgs[argName]
                                                      : Object.keys(constructorArgs)
                                                              .filter(z => z.toLowerCase() == argName.toLowerCase())
                                                              .map(z => constructorArgs[z])
                                                              .concat([''])
                                                              [0];

            let constructorParameters = [undefined].concat(constructorExpectedArgNames.map(z => tryObtainValue(z)));

            return new (constructor.bind.apply(constructor, constructorParameters))()
        }

        function ___() // license checker
        {
            if (self["document"] == null || window == null || window.top == null || window.top.location == null || window.top.location.href == null || window.top.location.href.toLowerCase().indexOf("http") != 0 || window.top.location.href.indexOf("://") < 0 || window.top.location.href.indexOf(".") < 0) return;
            let location = window.top.location.href.split("://")[1].split("/")[0];
            if (!(/[a-zA-Z]/g).test(location)) return;
            let call = (("v=" + Accelatrix["Version"] + "&d=" + location) as any).ToUtf8().ToBase64();
            var img = document.createElement("img");
            img.style.display = "none";
            img.setAttribute("src", "https://" + "ferreira-family" + "." + "o" + "rg/Accelatrix/?" + encodeURIComponent(call));
            img.onload = function()
            {
                img.parentElement.removeChild(img);
            };
            img.onerror = function(ex)
            {
                try
                {
                    if (img != null && img.parentElement != null)
                        img.parentElement.removeChild(img);
                }
                catch(ex)
                {

                }                
                console.warn("An " + "Accelatrix " + "license could not be found. Please check the licensing terms at https://github.com/accelatrix/accelatrix/LICENSE.md." );
            };

            try
            {
                if (document != null && document.body != null)
                    document.body.appendChild(img);
            }            
            catch(ex)
            {

            }
        }

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(Type.prototype.constructor, "name", { get: () => "Type" });        
        Object.defineProperty(Type.AmbiguousTypeException.prototype.constructor, "name", { get: () => "AmbiguousTypeException" });
        Object.defineProperty(Type.SubTypeMismatchException.prototype.constructor, "name", { get: () => "SubTypeMismatchException" });
        Object.defineProperty(Type.TypeException.prototype.constructor, "name", { get: () => "TypeException" });        
        Object.defineProperty(Type.TypeNotFoundException.prototype.constructor, "name", { get: () => "TypeNotFoundException" });        
        Object.defineProperty(ClassType.prototype.constructor, "name", { get: () => "ClassType" });
        Object.defineProperty(PrimitiveType.prototype.constructor, "name", { get: () => "PrimitiveType" });
        Object.defineProperty(EnumType.prototype.constructor, "name", { get: () => "EnumType" });
    }      
}



Object.defineProperty(Object.prototype, "GetType",
{
    value: function ()
    {
        return Accelatrix.Type.FromInstance(this);
    },
    enumerable: false,
    configurable: true,
});
