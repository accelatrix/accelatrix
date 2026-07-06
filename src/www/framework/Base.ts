import { Accelatrix as Accelatrix_Type } from './Type'

declare global
{
    export interface ITypeSystem
    {
        /** Gets a close-to-unique fingerprint of the object based on its public members. */
        GetHashCode() : number;
        /**
         * Gets a close-to-unique fingerprint of the object based on its public members.
         * @param persist If the resulting calculation should be persisted in the object's instance. This is only useful when objects are immutable.
         */
        GetHashCode(persist: boolean) : number;        

        /**
         * Indicates if the object is equal (not the same as same instance) to a given object's instance.
         * @param obj The object to compare against.
         */
        Equals(obj: any): boolean;

        /** Culture-aware string representation of the object using the default formatting in Accelatrix.Globalization.DefaultFormatting.*/
        ToString(): string;
    }

    export interface Object extends ITypeSystem
    {

    }    

    export interface ObjectConstructor extends Object
    {
        /**
         * Compares two objects from equatability.
         * @param first The first object to compare.
         * @param second The object to compare against.
         */
        AreEqual(first: any, second: any): boolean;
    }

    export interface Boolean extends ITypeSystem
    {
        
    }
}

/** Accelatrix namespace. */
export namespace Accelatrix
{
    export const Version = "1.0.0";

    /** A base exception. */
    export class Exception extends Error
    {
        public constructor(message: string)
        {
            super(String.IsNullOrWhiteSpace(message) ? "Unspecified exception." : message);

            var theMessage = this.message;
            Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.Exception"});
            Object.defineProperty(this, "Message", { enumerable: true, get: () => theMessage});            
        }

        /** Gets the message of the exception. */
        public get Message(): string
        {
            return this.message;
        }
    }

    /** An exception to be raised when a null argument passed onto a function is deemed as unexpected. */
    export class ArgumentNullException extends Exception
    {
        /**
         * Creates a new ArgumentNullException.
         * @param argumentName The name of the argument.
         */
        public constructor(argumentName: string)
        /**
         * Creates a new ArgumentNullException.
         * @param message A custom message.
         * @param argumentName The name of the argument.
         */
        public constructor(message: string, argumentName: string)
        /**
         * Creates a new ArgumentNullException.
         * @param message  A custom message.
         * @param argumentName The name of the argument.
         */
        public constructor(message: string, argumentName?: string)
        {
            let msg = argumentName == null || argumentName.trim().length == 0
                      ? "Argument '" + message + "' cannot be null."
                      : message;

            super(msg);

            Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.ArgumentNullException"});
        }
    }

    /** An exception to be raised when an argument passed onto a function is deemed as unexpected. */
    export class ArgumentException extends Exception
    {
        /**
         * Creates a new ArgumentNullException.
         * @param argumentName The name of the argument.
         */
        public constructor(argumentName: string)
        /**
         * Creates a new ArgumentNullException.
         * @param message A custom message.
         * @param argumentName The name of the argument.
         */
        public constructor(message: string, argumentName: string)
        /**
         * Creates a new ArgumentNullException.
         * @param message  A custom message.
         * @param argumentName The name of the argument.
         */
        public constructor(message: string, argumentName?: string)
        {
            let msg = String.IsNullOrWhiteSpace(argumentName)
                      ? "Argument '" + message + "' is unexpected."
                      : message;

            super(msg);

            Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.ArgumentException"});
        }
    }

    /** An exception to be raised when aborting an ongoing request. */
    export class AbortException extends Exception
    {

        /** Creates a new AbortException instance with a default message. */
        public constructor()
        /**
         * Creates a new AbortException instance.
         * @param message The message.
         */
        public constructor(message: string)
        /**
         * Creates a new AbortException instance.
         * @param message The message.
         */        
        public constructor(message?: string | undefined)
        {
            super(String.IsNullOrWhiteSpace(message) ? "Abort" : message ?? "");
            Object.defineProperty(this, "$type", { enumerable: true, configurable: true, get: () => "Accelatrix.AbortException"});
        }
    }

    /**
     * Decorator to mark and make classes immutable.
     * This will prevent any changes to be conducted to the class and persist its .GetHashCode().
     * @param constructor The class constructor.
     * @returns Returns the modified class constructor.
     */
    export function ImmutableObject<T extends { new (...args: any[]): {} }>(constructor: T): T
    {
        var original = constructor;

        var f = function (...args)
        {
            //let _this = new original(...args);
            //let _this = original.call(this, args);

            if (args != null)
                args = [ undefined ].concat(args);
        
            let _this = new (original.bind.apply(original, args as any))() as any;

            _this["__proto__"].constructor = f;
            ImmutableObject.Freeze(_this as any);
            return _this;
        };

        Object.defineProperty(f, "name", { value: original["name"] });

        let parametersInOriginal = constructor.toString().substring(constructor.toString().indexOf("(") + 1, constructor.toString().indexOf(")")).trim().split(",").map(z => z.trim());

        if (parametersInOriginal.length > 0)
            Object.defineProperty(f, "ConstructorArgs", { value: parametersInOriginal });

        f.prototype = original.prototype;
        f["__proto__"] = original["__proto__"];

        Object.keys(original)
              .forEach(z => f[z] = original[z]);        

        return <T><any>f;
    }

    export namespace ImmutableObject
    {
        /**
         * Indicates if a given object is frozen.
         * @param obj The object to probe.
         * @returns Returns if the specified object is frozen.
         */
        export const IsFrozen = (obj: object) => obj == null
                                                 ? false
                                                 : Object.isFrozen(obj);

        /**
         * Makes an object immutable by freezing it and persisting its GetHashCode().
         * @param obj The object to freeze.
         * @param propagate If the children should be frozen as well.
         */
        export const Freeze = (obj: object, propagate?: boolean) =>
                              {
                                  if (obj == null || IsFrozen(obj)) return;

                                  let myType = obj.GetType();

                                  if (myType.IsPrimitive && !myType.IsArray && myType.Name != "Object") return;

                                  if (propagate)
                                  {
                                      Object.getOwnPropertyNames(obj)
                                            .filter(z => z != "GetType" && z != "GetHashCode" && z != "Equals" && z != "ToString" && z != "$type")
                                            .map(z => Base.SafePropertyReader(obj, z))
                                            .filter(z => z != null)
                                            .forEach(z => Freeze(z, true));
                                  }

                                  // Just-in-time calculation + persitance of GetHashCode
                                  var hashCode: number;
                                  var originalHasher = obj.GetHashCode.bind(obj);
                                  Object.defineProperty(obj, "GetHashCode", { value: function ()
                                  { 
                                      if (hashCode == null)
                                      {
                                        hashCode = originalHasher();
                                        originalHasher = null as any;
                                      }                                        
                                      return hashCode;
                                  },
                                  enumerable: false});

                                  // vs. persisted ahead
                                  //obj.GetHashCode(true);
                                  Object.freeze(obj);
                              };
    }

    namespace Base
    {
        export function SafePropertyReader(instance: object, name: string)
        {
            try
            {
                let result = instance == null ? null : instance[name];
                return result == null || result === instance || result === this // circular references
                        ? null
                        : result;
            }
            catch(ex)
            {
                return null;
            }
        };

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(Accelatrix.Exception.prototype.constructor, "name", { get: () => "Exception" });
        Object.defineProperty(Accelatrix.AbortException.prototype.constructor, "name", { get: () => "AbortException" });
        Object.defineProperty(Accelatrix.ArgumentException.prototype.constructor, "name", { get: () => "ArgumentException" });
        Object.defineProperty(Accelatrix.ArgumentNullException.prototype.constructor, "name", { get: () => "ArgumentNullException" });
    }
}

Object.defineProperty(Object.prototype, "GetHashCode",
{
    value: function (persistHashCode?: boolean)
    {
        let myType = this.GetType();

        let returnAndPersist = (hashCode: number) =>
        {
            if (persistHashCode == true && !Object.isFrozen(this))
                Object.defineProperty(this, "GetHashCode", { value: () => hashCode, enumerable: false });

            return hashCode;
        };

        if (myType == Accelatrix["Type"].Date)
            return (this as Date).getTime();

        if (myType == Accelatrix["Type"].Boolean)
            return (this as Boolean) == true ? 1 : 0;

        if (myType == Accelatrix["Type"].Number && ((this as number) - Math. floor((this as number))) === 0) // number without decimals
            return Number(this);

        if (myType.IsArray)
        {
            var hash1 = 0;

            (this as Array<any>).forEach((value, index) =>
            {
                hash1 += value == null ? -1 * (index + 1) * ((index % 2) == 0 ? -1 : 1) : (index + 1) * value.GetHashCode() * ((index % 2) == 0 ? -1 : 1);
            });

            return returnAndPersist(hash1);
        }

        if (myType.IsPrimitive && myType.Name != "Object")
        {
            var hash2 = 0;
            let temp = this.toString();
            for (var index = 0; index < temp.length; index++)
                hash2 += (index + 1) * temp.charCodeAt(index) * ((index % 2) == 0 ? -1 : 1);
            hash2 = hash2 * (temp.length + 1);

            return hash2;
        }

        // objects with an Id property
        if (this["Id"] != null) return this["Id"].GetHashCode();
        if (this["id"] != null) return this["id"].GetHashCode();
        if (this["uid"] != null) return this["uid"].GetHashCode();

        // DOM objects
        if (this.isEqualNode != null && this.outerHTML != null) return this.outerHTML.GetHashCode();

        let hash3 = 0;

        var me = this;
        let safePropertyReader = (instance: object, name: string) =>
                                 {
                                    try
                                    {
                                        let result = instance === null ? null : instance[name];
                                        return result == null || result === instance || result === me // circular references
                                               ? null
                                               : result;
                                    }
                                    catch(ex)
                                    {
                                        return null;
                                    }
                                 };

        myType.GetProperties().map(z => z.Name)
              .concat(myType.GetFields().map(z => z.Name))
              .concat(Object.keys(this))
              .filter((value, index, array) => array.indexOf(value) === index)              
              .filter(z => z != "GetType" && z != "GetHashCode" && z != "Equals" && z != "ToString" && z != "__proto__" && z != "$type")
              .map(z => ({ Key: z, Value: safePropertyReader(this, z) }))
              .forEach(z =>
                      {
                          hash3 += z.Value == null
                                   ? z.Key.GetHashCode() -1
                                   : z.Key.GetHashCode() + z.Value.GetHashCode();
                      });

        return returnAndPersist(hash3);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Object.prototype, "Equals",
{
    value: function (obj?: any)
    {        
        if (obj == null)            
            return this == false && this instanceof Boolean
                   ? true
                   : false;

        if (this == obj) return true; // same instance

        // DOM objects
        if (this.isEqualNode != null && obj.isEqualNode != null)
            return this.isEqualNode(obj);

        let myType = this.GetType() as Accelatrix_Type.Type;
        let otherType = obj.GetType() as Accelatrix_Type.Type;        

        if (myType.IsPrimitive && !otherType.IsPrimitive) return false;
        if (!myType.IsPrimitive && otherType.IsPrimitive) return false;

        // check for implicit type conversions
        if (myType.IsPrimitive && otherType.Name != "Object")
        {
            if (myType.Name == "String")
                return (this as string) == obj.toString() || (this as string) == obj.ToString();

            if (myType.Name == "RegExp" || myType.Name == "Number")
                return this.toString() == obj.toString() || this.ToString() == obj.ToString();

            if (myType.Name == "Date")
                return this.toString() == obj.toString() || this.ToString() == obj.ToString() || (this as Date).getTime().toString() == obj.toString();

            if (myType.Name == "Boolean")
                return (this as Boolean) == true
                       ? obj == true || obj == 1 || obj == -1 || obj.toString() == "true"
                       : obj == false || obj == 0 || obj == null || obj.toString() == "false";

            if (myType.Name == "Function")
                return this.toString() == obj.toString();

            if (myType.IsArray)
            {
                if ((this as Array<any>).length != obj.length)
                    return false;
            }
        }

        // Hash code-based comparison if objects are immutable, otherwise this operation could be slower
        if (Object.getOwnPropertyDescriptor(this, "GetHashCode") != null && Object.getOwnPropertyDescriptor(obj, "GetHashCode") != null && this.GetHashCode() != obj.GetHashCode())
            return false;

        var me = this;
        let safePropertyReader = (instance: object, name: string) =>
                                 {
                                    try
                                    {
                                        let result = instance == null ? null : instance[name];
                                        return result == null || result === instance || result === me // circular references
                                                ? null
                                                : result;
                                    }
                                    catch(ex)
                                    {
                                        return null;
                                    }
                                 };

        // Object-based comparison which also encompasses Arrays
        let myPropertiesAndValues = myType.GetProperties().map(z => z.Name)
                                          .concat(myType.GetFields().map(z => z.Name))
                                          .concat(Object.keys(this))
                                          .filter((value, index, array) => array.indexOf(value) === index)
                                          .filter(z => z != "GetType" && z != "GetHashCode" && z != "Equals" && z != "ToString" && z != "__proto__" && z != "$type")
                                          .map(z => ({ Key: z, Value: safePropertyReader(this, z) }));

        let myPropertiesMapToTheirs = myPropertiesAndValues.map(z =>
                                                                ({ 
                                                                    Key: z.Key,
                                                                    Value: z.Value,
                                                                    TheirValue: safePropertyReader(obj, z.Key)
                                                                }));

        for (var i = 0; i < myPropertiesMapToTheirs.length; i++)
            if ((myPropertiesMapToTheirs[i].TheirValue == null && myPropertiesMapToTheirs[i].Value != null) || (myPropertiesMapToTheirs[i].TheirValue != null && myPropertiesMapToTheirs[i].Value == null))
                return false;

        for (var i = 0; i < myPropertiesMapToTheirs.length; i++)
            if (myPropertiesMapToTheirs[i].Value != null && !myPropertiesMapToTheirs[i].Value.Equals(myPropertiesMapToTheirs[i].TheirValue))
                return false;

        return true;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Object, "AreEqual",
{
    value: function (first: any, second: any)
    {
        return first == second
               ? true
               : first === null && !(second === null)
                 ? false
                 : second === null && !(first === null)
                   ? false
                   : first == null && second == null
                     ? true
                     : first == null && second != null
                       ? false
                       : first.Equals(second);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Object.prototype, "ToString",
{
    value: function (formatting?: any) //Accelatrix.Globalization.ILocaleFormatInfo)
    {
        return this == null
               ? null
               : this instanceof Date
                 ? Accelatrix["Globalization"].FormatDate(this as Date, null, formatting)
                 : this instanceof Number
                   ? Accelatrix["Globalization"].FormatNumber(this as number, formatting)
                   : Accelatrix["Quantity"].IsQuantity(this)
                     ? Accelatrix["Quantity"].Format(this, formatting)
                     : this.toString();
    },
    enumerable: false,
    configurable: true,
});