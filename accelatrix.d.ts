declare global {
    export interface ITypeSystem {
        /** Gets a close-to-unique fingerprint of the object based on its public members. */
        GetHashCode(): number;
        /**
         * Gets a close-to-unique fingerprint of the object based on its public members.
         * @param persist If the resulting calculation should be persisted in the object's instance. This is only useful when objects are immutable.
         */
        GetHashCode(persist: boolean): number;
        /**
         * Indicates if the object is equal (not the same as same instance) to a given object's instance.
         * @param obj The object to compare against.
         */
        Equals(obj: any): boolean;
        /** Culture-aware string representation of the object using the default formatting in Accelatrix.Globalization.DefaultFormatting.*/
        ToString(): string;
    }
    export interface Object extends ITypeSystem {
    }
    export interface ObjectConstructor extends Object {
        /**
         * Compares two objects from equatability.
         * @param first The first object to compare.
         * @param second The object to compare against.
         */
        AreEqual(first: any, second: any): boolean;
    }
    export interface Boolean extends ITypeSystem {
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    const Version = "1.6.3";
    /** A base exception. */
    class Exception extends Error {
        constructor(message: string);
        /** Gets the message of the exception. */
        get Message(): string;
    }
    /** An exception to be raised when a null argument passed onto a function is deemed as unexpected. */
    class ArgumentNullException extends Exception {
        /**
         * Creates a new ArgumentNullException.
         * @param argumentName The name of the argument.
         */
        constructor(argumentName: string);
        /**
         * Creates a new ArgumentNullException.
         * @param message A custom message.
         * @param argumentName The name of the argument.
         */
        constructor(message: string, argumentName: string);
    }
    /** An exception to be raised when an argument passed onto a function is deemed as unexpected. */
    class ArgumentException extends Exception {
        /**
         * Creates a new ArgumentNullException.
         * @param argumentName The name of the argument.
         */
        constructor(argumentName: string);
        /**
         * Creates a new ArgumentNullException.
         * @param message A custom message.
         * @param argumentName The name of the argument.
         */
        constructor(message: string, argumentName: string);
    }
    /** An exception to be raised when aborting an ongoing request. */
    class AbortException extends Exception {
        /** Creates a new AbortException instance with a default message. */
        constructor();
        /**
         * Creates a new AbortException instance.
         * @param message The message.
         */
        constructor(message: string);
    }
    /**
     * Decorator to mark and make classes immutable.
     * This will prevent any changes to be conducted to the class and persist its .GetHashCode().
     * @param constructor The class constructor.
     * @returns Returns the modified class constructor.
     */
    function ImmutableObject<T extends {
        new (...args: any[]): {};
    }>(constructor: T): T;
    namespace ImmutableObject {
        /**
         * Indicates if a given object is frozen.
         * @param obj The object to probe.
         * @returns Returns if the specified object is frozen.
         */
        const IsFrozen: (obj: object) => boolean;
        /**
         * Makes an object immutable by freezing it and persisting its GetHashCode().
         * @param obj The object to freeze.
         * @param propagate If the children should be frozen as well.
         */
        const Freeze: (obj: object, propagate?: boolean) => void;
    }
}


declare global {
    export interface String extends ITypeSystem {
        /**
        * Replaces accented letters with their accent-free equivalent. Usefull for sorting and other string-based comparison functions.
        */
        Latinise: () => string;
        /** Splits on camel-case. */
        SplitCamelCase: () => string[];
        /**
        * If a string ends with a given suffix.
        *
        * @param suffix  The suffix to look for.
        */
        EndsWith: (suffix: string) => boolean;
        /**
        * Replaces a string with another, all occurrences.
        *
        * @param replaceWhat What to replace.
        *
        * @param replaceWhat What to replace with.
        */
        Replace: (replaceWhat: string, replaceWith: string) => string;
        /**
         * Formats a string by replacing tagged placeholders.
         * @param arg0 value of the first placeholder.
        */
        Format(arg0: any): string;
        /**
         * Formats a string by replacing tagged placeholders.
         * @param arg0 value of the first placeholder.
         * @param arg1 an optional value for the second placeholder.
        */
        Format(arg0: any, arg1: any): string;
        /**
         * Formats a string by replacing tagged placeholders.
         * @param arg0 value of the first placeholder.
         * @param arg1 an optional value for the second placeholder.
         * @param arg2 an optional value for the third placeholder.
        */
        Format(arg0: any, arg1: any, arg2: any): string;
        /**
         * Formats a string by replacing tagged placeholders.
         * @param arg0 value of the first placeholder.
         * @param arg1 an optional value for the second placeholder.
         * @param arg2 an optional value for the third placeholder.
         * @param arg3 an optional value for the fourth placeholder.
        */
        Format(arg0: any, arg1: any, arg2: any, arg3: any): string;
        /**
         * Formats a string by replacing tagged placeholders.
         * @param arg0 value of the first placeholder.
         * @param arg1 an optional value for the second placeholder.
         * @param arg2 an optional value for the third placeholder.
         * @param arg3 an optional value for the fourth placeholder.
        */
        Format(arg0: any, arg1?: any, arg2?: any, arg3?: any): string;
        /**
         * Formats a string by replacing tagged placeholders.
         * @param arg0 value of the first placeholder.
         * @param arg1 an optional value for the second placeholder.
         * @param arg2 an optional value for the third placeholder.
         * @param arg3 an optional value for the fourth placeholder.
         * @param arg4 an optional value for the fourth placeholder.
         * @param arg5 an optional value for the fourth placeholder.
         * @param arg6 an optional value for the fourth placeholder.
         * @param arg7 an optional value for the fourth placeholder.
         * @param arg8 an optional value for the fourth placeholder.
         * @param arg9 an optional value for the fourth placeholder.
        */
        Format(arg0: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any, arg9?: any): string;
    }
    export interface StringConstructor extends String {
        /**
        * If a string is null or empty or is comprised of just white spaces.
        * @param text The string to probe.
        */
        IsNullOrWhiteSpace(text: string): boolean;
    }
}
export {};



declare global {
    export interface Object {
        /** Gets the type of object, e.g. "String", "Date", "Boolean".*/
        GetType(): Accelatrix.Type;
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    /** The generic representation of a type.*/
    abstract class Type {
        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         */
        protected constructor(constructor: Function);
        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         * @param sampleInstance An instance of the object to infer additional metadata from.
         */
        protected constructor(constructor: Function, sampleInstance: any);
        /**
         * Creates a new Type instance.
         * @param constructor The constructor function that builds an instance of the Type.
         * @param sampleInstance An instance of the object to infer additional metadata from.
         * @param namespace The complete hierarchy of objects to get to the type.
         */
        protected constructor(constructor: Function, sampleInstance: any, namespace: string);
        /** Gets if the type corresponds to a JavaScript primitive type, e.g. String, Boolean, etc. */
        get IsPrimitive(): boolean;
        /** Gets if the type corresponds to an Enum. */
        get IsEnum(): boolean;
        /** Gets if the type corresponds to an Array. */
        get IsArray(): boolean;
        /** Gets if the type corresponds to a Class. */
        get IsClass(): boolean;
        /** Gets if the type corresponds to a Function. */
        get IsFunction(): boolean;
        /** Gets the name of the type. */
        get Name(): string;
        /** Gets the given name for the type by external consumers, e.g. the value of property $type used during JSON serialisation. */
        get Alias(): string;
        /** Gets the type of the current type inherits from. */
        get BaseType(): Type;
        /** Gets all types loaded into the Type system. */
        static get LoadedTypes(): Array<Type>;
        /** Gets the String type. */
        static get String(): Type;
        /** Gets the Number type. */
        static get Number(): Type;
        /** Gets the Bolean type. */
        static get Boolean(): Type;
        /** Gets the Date type. */
        static get Date(): Type;
        /** Gets the Array type. */
        static get Array(): Type;
        /** Gets the ByteArray type. */
        static get ByteArray(): Type;
        /** Gets the Object type. */
        static get Object(): Type;
        /** Gets the Function type. */
        static get Function(): Type;
        /** Gets the function that build a new instance of the type. */
        GetConstructor<T extends {
            new (...args: any[]): {};
        }>(): T;
        /** The name with namespace (when one could be obtained). */
        GetFullName(): string;
        /** Gets all properties (not fields/members) of the type. */
        GetProperties(): Array<{
            Name: string;
            /** If the property is inherited. */
            Inherited: boolean;
            /** When possible to determine, the expected type of the property. */
            Type?: Type;
            /** When possible to determine, if the property has a setter. */
            IsReadonly?: boolean;
        }>;
        /** Gets all fields (not properties) of the type. */
        GetFields(): Array<{
            /** The name of the field. */
            Name: string;
            /**hen possible to determine, the expected type of the property. */
            Type?: Type;
        }>;
        /** Creates a new instance from this type. */
        CreateNewInstance(): object;
        /**
         * Creates a new instance from this type.
         * @param constructorArgs The arguments to pass to the constructor, either as an ordered collection, or as a named collection.
         */
        CreateNewInstance(constructorArgs: Array<any> | object): object;
        /**
         * Indicates if the specified type is the same or a parent from the current type.
         * @param type The type to compare or its name.
         */
        IsOfType<T extends {
            new (...args: any[]): {};
        }>(type: Type | T | string): boolean;
        /**
         * Indicates if the specified type is the same or a descendant from the current type.
         * @param type The type to compare or its name.
         */
        IsAssignableFrom<T extends {
            new (...args: any[]): {};
        }>(type: Type | T | string): boolean;
        /** Gets the string representation of the Type. */
        toString(): string;
        /**
         * Gets the Type of the supplied object's instance.
         * @param obj The instance of the object to probe.
         * @returns Returns the Type of the supplied object's instance.
         */
        static FromInstance(obj: any): Type;
        /**
         * Gets the Type of the supplied object's constructor.
         * @param constructor The constructor.
         * @returns Returns the corresponding Type.
         */
        static FromConstructor(constructor: {
            new (...args: any[]): any;
        }): Type;
        /**
         * Gets the Type of the supplied object's constructor.
         * @param constructor The constructor.
         * @param alias The alias of the type, which should include namespace information, e.g. Bio.Mamal.Dog.
         * @returns Returns the corresponding Type.
         */
        static FromConstructor(constructor: {
            new (...args: any[]): any;
        }, alias: string): Type;
        /**
         * Gets all Types that match a specified name ordered by best match.
         * @param typeName The name of the type to retrieve.
         * @returns Returns all Types that match a specified name ordered by best match.
         */
        static FromName(typeName: string): Array<Type>;
        /** An exception pertaining to types. */
        static TypeException: {
            new (typeName: string): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
            new (typeName: string, message: string): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
        };
        /** An exception describing when a given type could not be found. */
        static TypeNotFoundException: {
            new (typeName: string): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
            new (typeName: string, message: string): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
        };
        /** An exception describing when a given type is not unique. */
        static AmbiguousTypeException: {
            new (typeName: string): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
            new (typeName: string, message: string): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
            new (typeName: string, message: string, otherTypes: Array<Type>): {
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
        };
        /** An exception describing when a given type is not of the expected subtype. */
        static SubTypeMismatchException: {
            new (superType: Type, subType: Type): {
                /** Gets the name of the subtype. */
                readonly SubTypeName: string;
                /** Gets the name of the type. */
                readonly TypeName: string;
                name: string;
                message: string;
                stack?: string;
            };
        };
    }
}



declare global {
    export interface Object {
        /** Culture-aware string representation of the object using the default formatting in Accelatrix.Globalization.DefaultFormatting.*/
        ToString(): string;
        /**
         * Culture-aware string representation of the object using the specified formatting.
         * @param formatting The formatting to apply when creating the string representation of the object.
         */
        ToString(formatting: Accelatrix.Globalization.ILocaleFormatInfo): string;
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    /** Deals with localization. */
    class Globalization {
        /** Gets or sets the default formatting applied during .ToString() operations if an ILocaleFormatInfo is not provided. */
        static get DefaultFormatting(): Globalization.ILocaleFormatInfo;
        static set DefaultFormatting(value: Globalization.ILocaleFormatInfo);
        /** Gets or sets if dates should be serialised and deserialised with timezone. */
        static get TimezoneLess(): boolean;
        static set TimezoneLess(value: boolean);
    }
    /** Deals with localization. */
    module Globalization {
        /** Represent the formatting parameters for a given locale- */
        interface ILocaleFormatInfo {
            /** Gets the short date pattern, e.g. dd/mm/yyyy */
            readonly ShortDatePattern: string;
            /** Gets the short time pattern, e.g. hh:mm */
            readonly ShortTimePattern: string;
            /** Gets the decimal separator for numbers. */
            readonly NumberDecimalSeparator: string;
            /** Gets the thousands separator for numbers. */
            readonly NumberGroupSeparator: string;
            /** Gets the abbreviated form of the name of the months. */
            readonly AbbreviatedMonthNames: string[];
            /** Gets the abbreviated form for thousands, e.g. K. */
            readonly ThousandsSign: string;
            /** Gets the abbreviated form for thousands, e.g. M. */
            readonly MillionsSign: string;
            /** Gets the abbreviated form for thousands, e.g. B. */
            readonly BillionsSign: string;
        }
        /** Number simplification options. */
        enum NumberFormatSimplification {
            /** Specified precision is applied. */
            None = 0,
            /** Number is presented as K, M, B as appropriate. */
            Simplify = 1,
            /** Number is presented as B, KB, MB, GB, TB, PB as appropriate. */
            Bytes = 2
        }
        /**
         * Formats a Date as String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         */
        function FormatDate(date: Date): string;
        /**
         * Formats a Date as String according to a default ILocaleFormatInfo.
         * @param date The date for format.
         * @param abbreviatedMonth If hhe the month component should be forced to be textual or numeric (null for locale's setting).
         */
        function FormatDate(date: Date, abbreviatedMonth: boolean): string;
        /**
         * Formats a Date as String according to a specified ILocaleFormatInfo.
         * @param date The date for format.
         * @param abbreviatedMonth If hhe the month component should be forced to be textual or numeric (null for locale's setting).
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         * @returns Returns the date as a localized string.
         */
        function FormatDate(date: Date, abbreviatedMonth: boolean, formats: ILocaleFormatInfo): string;
        /**
         * Formats a Date as a string containing the day and the name of the month according to the default ILocaleFormatInfo.
         * @param date The date to format.
         * @returns Returns the formatted date.
         */
        function FormatDayMonth(date: Date): string;
        /**
         * Formats a Date as a string containing the day and the name of the month according to the specified ILocaleFormatInfo.
         * @param date The date to format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         * @returns Returns the formatted date.
         */
        function FormatDayMonth(date: Date, formats: ILocaleFormatInfo): string;
        /**
         * Formats a Date as a string containing the name of the month and the year according to the default ILocaleFormatInfo.
         * @param date The date to format.
         * @returns Returns the formatted date.
         */
        function FormatMonthYear(date: Date): string;
        /**
         * Formats a Date as a string containing the name of the month and the year according to the specified ILocaleFormatInfo.
         * @param date The date to format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         * @returns Returns the formatted date.
         */
        function FormatMonthYear(date: Date, formats: ILocaleFormatInfo): string;
        /**
         * Formats a Date with time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         */
        function FormatDateTime(date: Date): string;
        /**
         * Formats a Date with time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         * @param formats It a different set of formats should be used instead of Globalization.DefaultFormatting.
         * @returns Returns the date as a localized time string.
         */
        function FormatDateTime(date: Date, formats: ILocaleFormatInfo): string;
        /**
         * Formats a Date as time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         */
        function FormatTime(date: Date): string;
        /**
         * Formats a Date as time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         * @param formats It a different set of formats should be used instead of Globalization.DefaultFormatting.
         * @returns Returns the date as a localized time string.
         */
        function FormatTime(date: Date, formats: ILocaleFormatInfo): string;
        /**
         * Parses a month year string back into a date according to the default ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         */
        function ParseMonthYear(monthYear: string): Date;
        /**
         * Parses a month year string back into a date according to the specified ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        function ParseMonthYear(monthYear: string, formats: ILocaleFormatInfo): Date;
        /**
         * Parses a date string back into a date according to the default ILocaleFormatInfo.
         * @param date The date string to parse.
         */
        function ParseDate(date: string): Date;
        /**
         * Parses a date string back into a date according to the specified ILocaleFormatInfo.
         * @param date The date string to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        function ParseDate(date: string, formats: ILocaleFormatInfo): Date;
        /**
         * Formats a boolean as string.
         * @param value The value to format.
         * @returns Returns the string represenation of the boolean.
         */
        function FormatBoolean(value?: Boolean): string;
        /**
         * Formats a number as string according to the default ILocaleFormatInfo.
         * @param number The number to format.
         */
        function FormatNumber(number: number): string;
        /**
         *
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         */
        function FormatNumber(number: number, precision: number): string;
        /**
         * Formats a number as string according to the default ILocaleFormatInfo.
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param numberFormatSimplification If the number should be simplified, e.g. 1.1K, 2.2M.
         */
        function FormatNumber(number: number, precision: number, numberFormatSimplification: NumberFormatSimplification): string;
        /**
         * Formats a number as string according to the specific ILocaleFormatInfo.
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param numberFormatSimplification If the number should be simplified, e.g. 1.1K, 2.2M.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        function FormatNumber(number: number, precision: number, numberFormatSimplification: NumberFormatSimplification, formats: ILocaleFormatInfo): string;
        /**
         * Parses a number string back into a number according to the default ILocaleFormatInfo.
         * @param number The number to parse.
         */
        function ParseNumber(number: string): number;
        /**
         * Parses a number string back into a number according to the specific ILocaleFormatInfo.
         * @param number The number to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        function ParseNumber(number: string, formats: ILocaleFormatInfo): number;
        /** The number and date formats associated with a given locale. */
        class LocaleFormatInfo implements Globalization.ILocaleFormatInfo {
            /**
             * Creates a new LocaleFormatInfo instance.
             * @param shortDatePattern The short date pattern, e.g. dd/mm/yyyy
             * @param shortTimePattern The short time pattern, e.g. hh:.
             * @param numberDecimalSeparator The decimal separator for numbers.
             * @param numberGroupSeparator The thousands separator for numbers.
             * @param abbreviatedMonthNames Tthe abbreviated form of the name of the months.
             * @param thousandsSign The abbreviated form for thousands, e.g. K.
             * @param millionsSign The abbreviated form for thousands, e.g. M.
             * @param billionsSign The abbreviated form for thousands, e.g. B.
             */
            constructor(shortDatePattern: string, shortTimePattern: string, numberDecimalSeparator: string, numberGroupSeparator: string, abbreviatedMonthNames: string[], thousandsSign: string, millionsSign: string, billionsSign: string);
            /** Gets the short date pattern, e.g. dd/mm/yyyy. */
            get ShortDatePattern(): string;
            /** Gets the short time pattern, e.g. hh:. */
            get ShortTimePattern(): string;
            /** Gets the decimal separator for numbers. */
            get NumberDecimalSeparator(): string;
            /** Gets the thousands separator for numbers. */
            get NumberGroupSeparator(): string;
            /** Gets the abbreviated form of the name of the months. */
            get AbbreviatedMonthNames(): string[];
            /** Gets the abbreviated form for thousands, e.g. K. */
            get ThousandsSign(): string;
            /** Gets the abbreviated form for thousands, e.g. M. */
            get BillionsSign(): string;
            /** Gets the abbreviated form for thousands, e.g. B. */
            get MillionsSign(): string;
            /**
             * Gets the formats associated with a culture code.
             * @param cultureCode The ISo culture code, e.g. en-US, en-GB, pt-PT;
             * @returns Returns the formats associated with the specifi«ed culture code.
             */
            static FromCultureCode(cultureCode: string): LocaleFormatInfo;
            /**
             * Gets the formats associated with the current browser environment.
             * @returns Returns the formats associated with the current browser environment.
             */
            static FromEnvironment(): LocaleFormatInfo;
        }
    }
}




declare global {
    /** Number definition. */
    export interface Number extends ITypeSystem {
        /**
         * Adds a number or quantity to the current number and produces a new number instance.
         *
         * @param operands  A single number, or a single quantity, or a collection of numbers, or a collection of quantities.
         *
         * @param allowDifferentUnits If quantities of different unit types can be added.
         */
        Add(operands: number | Accelatrix.IQuantity<Accelatrix.IUnit> | Array<number | Accelatrix.IQuantity<Accelatrix.IUnit>>, allowDifferentUnits?: boolean): number;
        /**
         * Culture-aware representation of the number according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.
         */
        ToString(): string;
        /**
         * Culture-aware representation of the number according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         */
        ToString(precision: number): string;
        /**
         * Culture-aware representation of the number according to a specific ILocaleFormatInfo.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToString(precision: number, formatting: ILocaleFormatInfo): string;
        /**
         * Culture-aware representation of the number according to a specific ILocaleFormatInfo.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToString(precision?: number, formatting?: ILocaleFormatInfo): string;
        /**
         * Culture-aware parsing of number.
         * @param number  The culture-sensitive string to parse into a number.
         */
        Parse(number: string): number;
    }
    /** Number definition. */
    export interface NumberConstructor extends Number {
        /**
         * Culture-aware parsing of number.
         * @param number  The culture-sensitive string to parse into a number.
         */
        Parse(number: string): number;
        /**
         * Culture-aware parsing of number.
         * @param number The culture-sensitive string to parse into a number.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        Parse(number: string, formatting: ILocaleFormatInfo): number;
        /**
         * Culture-aware parsing of number.
         * @param number The culture-sensitive string to parse into a number.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        Parse(number: string, formatting?: ILocaleFormatInfo): number;
    }
    /** Represent the formatting parameters for a given locale- */
    interface ILocaleFormatInfo {
        /** Gets the short date pattern, e.g. dd/mm/yyyy */
        readonly ShortDatePattern: string;
        /** Gets the short time pattern, e.g. hh:mm */
        readonly ShortTimePattern: string;
        /** Gets the decimal separator for numbers. */
        readonly NumberDecimalSeparator: string;
        /** Gets the thousands separator for numbers. */
        readonly NumberGroupSeparator: string;
        /** Gets the abbreviated form of the name of the months. */
        readonly AbbreviatedMonthNames: string[];
        /** Gets the abbreviated form for thousands, e.g. K. */
        readonly ThousandsSign: string;
        /** Gets the abbreviated form for thousands, e.g. M. */
        readonly MillionsSign: string;
        /** Gets the abbreviated form for thousands, e.g. B. */
        readonly BillionsSign: string;
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    /** Represents a unit of an IQuantity. */
    interface IUnit {
        /** The code of the unit, e.g. EUR. */
        Code: string;
        /** The given name of the unit, e.g. European Union Euro. */
        Name?: string;
        /** The short name, e.g. €. */
        ShortName?: string;
    }
    /** A generic quantity with a unit. */
    interface IQuantity<T extends IUnit> {
        /** The full precision numeric amount.*/
        Amount: number;
        /**
         * Gets the precision used for representation as a power of 10.
         * Null means that the amount is to be presented in full precision.
         * 0 or 1 means that the amount should be displayed without decimals,
        */
        Precision: number;
        /** The unit of the amount. */
        Unit: T;
        /**
        * Adds a number or quantity to the current number and produces a new number instance.
        *
        * @param operands  A single number, or a single quantity, or a collection of numbers, or a collection of quantities.
        */
        Add?: (operands: number | IQuantity<T> | Array<number | IQuantity<T>>) => IQuantity<T>;
    }
    /** A base implementation of IQuantity<T>. Consider decorating descendant tyoes with the Accelatrix.ImmutableObject decorator. */
    abstract class Quantity<T extends IUnit> implements IQuantity<IUnit> {
        /**
         * Createa a new Quantity intance.
         * @param amount The amount in full precision.
         * @param unit The unit or its string representation.
         */
        protected constructor(amount: number, unit: T | string);
        /**
         * Createa a new Quantity intance.
         * @param amount The amount in full precision.
         * @param unit The unit or its string representation.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        protected constructor(amount: number, unit: T | string, precision: number);
        /** Gets the full precision numeric amount.*/
        get Amount(): number;
        /** Gets the unit of the amount. */
        get Unit(): T;
        /**
         * Gets the precision used for representation as a power of 10.
         * Null means that the amount is to be presented in full precision.
         * 0 or 1 means that the amount should be displayed without decimals,
        */
        get Precision(): number;
        /**
         * Adds a number or quantity to the current number and produces a new number instance.
         * @param operands  A single number, or a single quantity, or a collection of numbers, or a collection of quantities.
         */
        Add(operands: number | IQuantity<T> | Array<number | IQuantity<T>>): IQuantity<T>;
        /**
         * Indicates if a given object is an IQuantity or a number.
         * @param obj The object to test.
         */
        static IsQuantity(obj: any): boolean;
        /**
         * Gets the culture-aware string representation of a Quantity according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.
         * @param quantity The quantity to format.
         */
        static Format(quantity: IQuantity<IUnit>): string;
        /**
         * Gets the culture-aware string representation of a Quantity according to the specified ILocaleFormatInfo.
         * @param quantity The quantity to format.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        static Format(quantity: IQuantity<IUnit>, formatting: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /**
         * Adds a collection of quantities.
         * @param operands A collection of numbers or quantities.
         */
        static Add<Tin extends IUnit>(operands: Array<number | IQuantity<Tin>>): IQuantity<Tin>;
        /**
         * Creates a new generic immutable quantity.
         * @param amount The amount.
         * @param unit The unit or its name.
         */
        static Generic<TUnit extends IUnit>(amount: number, unit: TUnit | string): any;
        /**
         * Creates a new generic immutable quantity.
         * @param amount The amount.
         * @param unit The unit or its name.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        static Generic<TUnit extends IUnit>(amount: number, unit: TUnit | string, precision: number): any;
        /**
         * Creates a new immutable percentage.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         */
        static Percentage<TUnit extends IUnit>(amount: number): any;
        /**
         * Creates a new immutable percentage.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        static Percentage<TUnit extends IUnit>(amount: number, precision: number): any;
        /**
         * Creates a new immutable unitless quantity.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         */
        static Unitless<TUnit extends IUnit>(amount: number): any;
        /**
         * Creates a new immutable unitless quantity.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        static Unitless<TUnit extends IUnit>(amount: number, precision: number): any;
    }
}




declare global {
    export interface Date {
        /** Produces a culture-aware long date string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToDateTimeString(): string;
        /**
         * Produces a culture-aware long date string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToDateTimeString(formatting: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware long date string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToDateTimeString(formatting?: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /** Produces a culture-aware time string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToTimeString(): string;
        /**
         * Produces a culture-aware time string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToTimeString(formatting: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware time string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToTimeString(formatting?: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /** Produces a culture-aware day & month string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToDayMonthString(): string;
        /**
         * Produces a culture-aware day & month string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToDayMonthString(formatting: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware day & month string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToDayMonthString(formatting?: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /** Produces a culture-aware month & year string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToMonthYearString(): string;
        /**
         * Produces a culture-aware month & year string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToMonthYearString(formatting: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware month & year string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToMonthYearString(formatting?: Accelatrix.Globalization.ILocaleFormatInfo): string;
        /**
         * If the date is greater than a given date.
         * @param date The date to compare against.
         */
        Greater(date: Date): boolean;
        /**
         * If the date is greater or equal than a given date.
         * @param date The date to compare against.
         */
        GreaterOrEqual(date: Date): boolean;
        /**
         * If the date is lesser than a given date.
         * @param date The date to compare against.
         */
        Lesser(date: Date): boolean;
        /**
         * If the date is lesser or equal than a given date.
         * @param date The date to compare against.
         */
        LesserOrEqual(date: Date): boolean;
        /**
         * Adds years to a date.
         * @param years The number of years to add.
         */
        AddYears(years: number): Date;
        /**
         * Adds months to a date.
         * @param months The number of months to add.
         */
        AddMonths(months: number): Date;
        /**
         * Adds days to a date.
         * @param days The number of days to add.
         */
        AddDays(days: number): Date;
        /**
         * Adds hours to a date.
         * @param days The number of hours to add.
         */
        AddHours(hours: number): Date;
        /**
         * Adds minutes to a date.
         * @param minutes The number of minutes to add.
         */
        AddMinutes(minutes: number): Date;
        /**
         * Adds seconds to a date.
         * @param seconds The number of seconds to add.
         */
        AddSeconds(seconds: number): Date;
        /**
         * Adds milliseconds to a date.
         * @param milliseconds The number of milliseconds to add.
         */
        AddMilliseconds(milliseconds: number): Date;
        /**
         * The difference in months between two dates.
         * @param date The date to diff against.
         */
        DiffMonths: (date: Date) => number;
    }
    /**
    * The date base type.
    */
    export interface DateConstructor extends Date {
        /**
         * Parses a culture-sensitive string back into a date object according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.
         * @param date The culture-sensitive string to parse.
         */
        Parse(date: string): Date;
        /**
         * Parses a culture-sensitive string back into a date object according to a specific ILocaleFormatInfo.
         * @param date The culture-sensitive string to parse.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        Parse(date: string, formatting: Accelatrix.Globalization.ILocaleFormatInfo): Date;
        /**
         * Parses a culture-sensitive string back into a date object according to a specific ILocaleFormatInfo.
         * @param date The culture-sensitive string to parse.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        Parse(date: string, formatting?: Accelatrix.Globalization.ILocaleFormatInfo): Date;
        /**
         * Parses a culture-sensitive string with month and year back into a date object according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.
         * @param monthYear The culture-sensitive month with year string to parse.
         */
        FromMonthYear(monthYear: string): Date;
        /**
         * Parses a culture-sensitive string with month and year back into a date object according to a specified ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        FromMonthYear(monthYear: string, formatting: Accelatrix.Globalization.ILocaleFormatInfo): Date;
        /**
         * Parses a culture-sensitive string with month and year back into a date object according to a specified ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        FromMonthYear(monthYear: string, formatting?: Accelatrix.Globalization.ILocaleFormatInfo): Date;
        /** Gets the current moment in time. */
        readonly Now: Date;
    }
    export interface ObjectConstructor extends Object {
        /**
         * Unboxes ISO serialized dates into date objects in a recursive manner.
         * @param obj The object for which serialized dates are to be unboxed.
         */
        UnboxDates(obj: object): void;
    }
}


declare global {
    export interface Uint8Array {
        /** Convert a byte array into a base64 string. */
        ToBase64(): string;
        /** Creates a string from UTF8 byte array. */
        ToUtf8String: () => string;
        /** Creates an hexdecimal string from the byte array. */
        ToHexString: () => string;
        /** Creates a SHA-256 hash and returns a promise-like response. */
        GetHash: () => {
            then: (onfulfilled: (value: string) => void) => {
                catch: (onrejected: (err: Error) => void) => void;
            };
            catch: (onrejected: (err: Error) => void) => {
                then: (onfulfilled: (value: string) => void) => void;
            };
        };
    }
    export interface ArrayBuffer {
        /** Convert a byte array into a base64 string. */
        ToBase64(): string;
        /** Creates a string from UTF8 byte array. */
        ToUtf8String: () => string;
        /** Creates an hexdecimal string from the byte array. */
        ToHexString: () => string;
    }
    export interface Uint8ArrayConstructor extends Uint8Array {
        /**
         * Converts a Base64 string into a byte array.
         * @param base64String The Base54-encoded string.
         */
        FromBase64(base64String: string): Uint8Array;
    }
    export interface String {
        /** Converts string to ANSII Byte Array. */
        ToAnsii: () => Uint8Array;
        /** Converts string to UTF8 Byte Array. */
        ToUtf8: () => Uint8Array;
        /** Creates a SHA-256 hash and returns a promise-like response. */
        GetHash: () => {
            then: (onfulfilled: (value: string) => void) => {
                catch: (onrejected: (err: Error) => void) => void;
            };
            catch: (onrejected: (err: Error) => void) => {
                then: (onfulfilled: (value: string) => void) => void;
            };
        };
    }
    export interface StringConstructor extends String {
        /**
         * Convets UTF8 bytes back into a string.
         * @param bytes The byte array to read from.
         */
        FromBytes(bytes: Uint8Array): string;
    }
}
export {};







declare global {
    /** Array as IEnumerable. */
    export interface Array<T> extends Accelatrix.Collections.IEnumerableOps<T> {
    }
    export interface ObjectConstructor extends Object {
        /**
        * Flattens a hierarchy contained within an object into a single sequence, e.g. myHierarchy.FlattenHierarchy(z => z.Children).
        * @param obj The root object to flatten.
        * @param childEnumerator The predicate that given one element retrieves the list of children.
        */
        FlattenHierarchy<T>(obj: Object, childEnumerator: (item: T) => Accelatrix.Collections.IEnumerableOps<T>): Accelatrix.Collections.IEnumerableOps<T>;
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    namespace Collections {
        /** Supports a simple iteration over an enumeration of a specified type. */
        export interface IEnumerator<T> {
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
        export interface IEnumerable<T> {
            /** Gets the enumerator to iterate through the enumeration. */
            GetEnumerator(): IEnumerator<T>;
        }
        /** A grouped enumeration.  */
        export interface IGrouping<TKey, T> extends IEnumerableOps<T> {
            Key: TKey;
        }
        /** Enumerable operations in enumerations. */
        export interface IEnumerableOps<T> extends IEnumerable<T> {
            /**
             * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
             * @param typeConstructor The type constructor, e.g. the reference to the class definition.
             */
            OfType<TFilter extends T>(typeConstructor: {
                new (...args: any[]): TFilter;
            }): IEnumerableOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param type The Accelatrix.Type of the type to filter.
             */
            OfType<TFilter extends T>(type: Accelatrix.Type): IEnumerableOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param typeName The name or full name of the type.
             */
            OfType<TFilter extends T>(typeName: string): IEnumerableOps<TFilter>;
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
            * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children).
            * @param selector The projection function.
            */
            SelectMany<TOut>(selector: (element: T, index?: number) => IEnumerableOps<TOut>): IEnumerableOps<TOut>;
            /**
            * Filters a sequence of values based on a predicate.
            * @param selector The selector function.
            */
            Where(selector: (element: T, index?: number) => boolean): IEnumerableOps<T>;
            /** Gets the first element of a sequence, or null if empty. */
            FirstOrNull(): T;
            /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
            LastOrNull(): T;
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
            * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
            * @param second The second enumeration to interleave with.
            */
            Interleave(second: IEnumerableOps<T>): IEnumerableOps<T>;
            /**
            * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
            * @param keySelector A function to extract the key from each element.
            * @param valueSelector A function to extract the value from each element.
            */
            ToDictionary<TKey, TOut extends IEnumerableOps<any>>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix.Collections.IHashMap<TKey, IEnumerableOps<TOut>>;
            /**
            * Sums all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Sum(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Averages all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Average(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Max of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Max(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Min of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Min(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
        }
        interface IteratorResult<T> {
            done: boolean;
            value: T;
        }
        interface Iterator<T> {
            next(value?: any): IteratorResult<T>;
            return?(value?: any): IteratorResult<T>;
            throw?(e?: any): IteratorResult<T>;
        }
        interface IterableIterator<T> extends Iterator<T> {
        }
        /** An enumeration. */
        export class Enumerable<T> implements IEnumerableOps<T> {
            /**
             * Extends the Enumerable<T> implementation and of its descendants.
             * @param func The new functional method, e.g. Accelatrix.Collections.Enumerable.AddFunctionalMethod(function ToIndexed(item, index) { return this.Select((z, i) => ({ Item: z, Index: i })) })
             */
            static AddFunctionalMethod<T>(func: {
                name: string;
                (this: IEnumerableOps<T>, ...args: any[]): IEnumerableOps<T>;
            }): void;
            /**
             * Creates a new Enumeration based on an existing enumeration.
             * @param enumerable An array, an enumeration, or a factory
             */
            constructor(enumerable: Array<T> | IEnumerableOps<T> | (() => IterableIterator<T>));
            /** Gets the enumerator to iterate through the enumeration. */
            GetEnumerator(): IEnumerator<T>;
            /** Freezes the current enumeration so that the position of the iterator is retained during subsquent calls. */
            Freeze(): IEnumerableOps<T>;
            /**  Gets if the sequence contains any elements. */
            Any(): boolean;
            /**  Gets if the sequence does not contain any elements. */
            NotAny(): boolean;
            /** Commits the enumeration and gets its count. */
            private get length();
            /** Gets the first element, or null, if not present. */
            private get 0();
            /** Commits the enumeration and gets the second element, or null, if not present. */
            private get 1();
            /** Convertion to JSON. */
            toJSON(): {
                $type: string;
                Members: any[];
            };
            /** Runs through the enumeration to produce a typed list. */
            ToList(): Array<T>;
            /** Commits the enumeration and gets its length. */
            Count(): number;
            /** Commits the enumeration as an array. */
            private ToArray;
            /**
             * Iterates through each element in the enumeration and executes an action. The loop can be halted if the action returns false.
             * @param action The action to execute. The cycle is halted if the action returns a boolean false.
             */
            ForEach(action: (element: T, index?: number) => boolean | void | any): void;
            /**
             * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
             * @param typeConstructorOrType The type constructor, e.g. the reference to the class, or the Accelatrix.Type of the type to filter.
             */
            OfType<TFilter extends T>(typeConstructorOrType: {
                new (...args: any[]): TFilter;
            } | Accelatrix.Type | string): IEnumerableOps<TFilter>;
            /** Wraps the enumeration. */
            ToEnumerable<T>(): IEnumerableOps<T>;
            /**
            * Projects each element of a sequence into a new form.
            *
            * @param selector The projection function.
            */
            Select<TOut>(selector: (element: T, index?: number) => TOut): IEnumerableOps<TOut>;
            /**
            * Concatenates one sequence after the existing.
            *
            * @param second The second enumeration.
            */
            Concat(second: IEnumerableOps<T>): IEnumerableOps<T>;
            /**
            * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children)
            *
            * @param selector The projection function.
            */
            SelectMany<TOut>(selector: (element: T, index?: number) => IEnumerableOps<TOut>): IEnumerableOps<TOut>;
            /**
             * Filters a sequence of values based on a predicate.
             * @param selector The filter predicate.
             */
            Where(selector: (element: T, index?: number) => boolean): IEnumerableOps<T>;
            /** Gets the first element of a sequence, or null if empty. */
            FirstOrNull(): T;
            /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
            LastOrNull(): T;
            /** Produces a new enumeration in reverse order, which implies that the enumeration is finite. */
            Reverse(): Array<T>;
            /** Gets all entries which are not null, and in string enumerations, not empty. */
            NotNullOrEmpty(): IEnumerableOps<T>;
            /** If a given element exists within the enumeration. */
            Contains(element: T): boolean;
            /** If a given element does not exist within the enumeration. */
            NotContains(element: T): boolean;
            /**
            * Sorts the sequence in ascending order.
            * @param comparer The sorting criteria;
            */
            OrderBy<TKey>(comparer?: (a: T, b: T) => number | any): Array<T>;
            /**
            * Sorts the sequence in ascending order.
            * @param comparer The sorting criteria;
            */
            OrderByDescending<TKey>(comparer?: (a: T, b: T) => number | any): Array<T>;
            /** Get the distinct members, which relies on Equals(). */
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
             * Skips the collection while a condition is tru.
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
            Zip<Tsecond, TOut>(second: IEnumerableOps<Tsecond>, resultSelector?: (element: T, second: Tsecond, index?: number) => TOut): IEnumerableOps<TOut>;
            /**
             * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
             * @param second The second enumeration to interleave with.
             */
            Interleave(second: IEnumerableOps<T>): IEnumerableOps<T>;
            /**
             * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
             * @param keySelector A function to extract the key from each element.
             * @param valueSelector A function to extract the value from each element.
             */
            ToDictionary<TKey, TOut extends IEnumerableOps<any>>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix.Collections.HashMap<TKey, IEnumerableOps<TOut>>;
            /**
            * Sums all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Sum(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Averages all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Average(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Max of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Max(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Min of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Min(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): number | Accelatrix.IQuantity<Accelatrix.IUnit>;
            /**
            * Creates a sequence of numbers.
            * @param start The first position of the sequence.
            * @param count The number of items in the sequece. If none is specified, the sequence will be infinite.
            */
            static Range(start: number, count?: number): IEnumerableOps<number>;
        }
        export {};
    }
}






export declare namespace Accelatrix {
    /** Collectipns namespace. */
    namespace Collections {
        /** A dictionary where the key is of any type. */
        interface IHashMap<TKey, TMember> extends Accelatrix.Collections.IEnumerableOps<{
            Key: TKey;
            Value: TMember;
        }> {
            /** Gets the enumeration of keys. */
            readonly Keys: Accelatrix.Collections.IEnumerableOps<TKey>;
            /** Gets the enumeration of values. */
            readonly Values: Accelatrix.Collections.IEnumerableOps<TMember>;
            /** Indicates if a given key already exists. */
            ContainsKey(key: TKey): boolean;
            /**
             * Adds an entry to the collection.
             * @param key The key of the entry.
             * @param value The value.
             */
            Add(key: TKey, value: TMember): any;
            /** Remove an entry based on the key. */
            Remove(key: TKey): any;
        }
        /** A dictionary where the key is of any type. */
        class HashMap<TKey, TMember> extends Array<{
            Key: TKey;
            Value: TMember;
        }> implements IHashMap<TKey, TMember> {
            /** Creates a new HashMap instance. */
            constructor();
            /**
             * Creates a new HashMap instance.
             * @param members The collection of members.
             */
            constructor(members: Accelatrix.Collections.IEnumerableOps<{
                Key: TKey;
                Value: TMember;
            }>);
            /** Gets the enumeration of keys. */
            get Keys(): Array<TKey>;
            /** Gets the enumeration of values. */
            get Values(): Array<TMember>;
            /** Indicates if a given key already exists. */
            ContainsKey(key: TKey): boolean;
            /**
             * Adds an entry to the collection.
             * @param key The key of the entry.
             * @param value The value.
             */
            Add(key: TKey, value: TMember): void;
            /** Remove an entry based on the key. */
            Remove(key: TKey): void;
        }
        /** An exception depicting a duplicate member. */
        class DuplicateMemberException extends Accelatrix.Exception {
            /**
             * Creates a new ArgumentNullException.
             * @param member The member.
             */
            constructor(member: any);
            /**
             * Creates a new ArgumentNullException.
             * @param message A custom message.
             * @param member The member.
             */
            constructor(message: string, member: any);
        }
    }
}




export declare namespace Accelatrix {
    /** Deals with JSON serialization. */
    namespace Serialization {
        /**
         * Parses a JSON string into a typed class where the expected type in contained in a $type property.
         * @param json The JSON string to deserialize.
         * @returns Returns the deserialized class according to the specified type.
         */
        function FromJSON<T>(json: string): T;
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param type The type constructor, e.g. the reference to the class definition.
         * @returns Returns the deserialized class according to the specified type.
         */
        function FromJSON<T>(json: string, type: {
            new (...args: any[]): T;
        }): T;
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param type The Accelatrix.Type of the type to filter.
         * @returns Returns the deserialized class according to the specified type.
         */
        function FromJSON<T>(json: string, type: Accelatrix.Type): T;
        /**
         * Parses a JSON string into a typed class.
         * @param json The JSON string to deserialize.
         * @param typeName The name or full name of the type or its alias ($type).
         * @returns Returns the deserialized class according to the specified type.
         */
        function FromJSON<T>(json: string, typeName: string): T;
        /**
         * Serializes an object as JSON and includes $type annotations.
         * @param obj The object to serialize.
         */
        function ToJSON(obj: any): string;
        /**
         * Decorator to mark a class in order to register its type during a deserialization process.
         * @param constructor The class constructor.
         */
        function KnownType<T extends {
            new (...args: any[]): {};
        }>(constructor: T): any;
        /**
         * Decorator to mark a class in order to register its type during a deserialization process.
         * @param alias The alias of the type, which should include namespace information, e.g. Bio.Mamal.Dog.
         */
        function KnownType<T extends {
            new (...args: any[]): {};
        }>(alias: string): any;
        /**
         * A decorator to mark a property as serializable.
         */
        function DataMember(): any;
        /**
         * A decorator to mark a property as serializable.
         * @param include If it should be included.
         */
        function DataMember(include: boolean): any;
        /** Decorator to tag the method to be invoked when serialization begins. */
        function OnSerializing(): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
        /** Decorator to tag the method to be invoked when serialization ends. */
        function OnSerialized(): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
        /** Decorator to tag the method to be invoked when deserialization begins. */
        function OnDeserializing(): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
        /** Decorator to tag the method to be invoked when deserialization ends. */
        function OnDeserialized(): (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => void;
    }
}



export declare namespace Accelatrix {
    module Async {
        /** An ongoing promise-like request that can be cancelled, along with the error and result callback. */
        interface ICancellablePromise<T> extends PromiseLike<T> {
            /** Cancels an ongoing request by raising an AbortException. */
            Cancel(): void;
            /** Attaches a callback to the rejection of the promise. */
            Catch(onrejected: (exception: Accelatrix.Exception) => void): ICancellablePromise<T>;
            /** Attaches a callback to the rejection of the promise. */
            catch(onrejected: (exception: Accelatrix.Exception) => void): ICancellablePromise<T>;
            /** Attaches callbacks for the resolution and/or rejection of the Promise. */
            Then(onfulfilled: (value: T) => void): ICancellablePromise<T>;
            /** An optional callback to invoke once the request is complete. */
            Finally(callback: () => void): ICancellablePromise<T>;
        }
        /** A cancellable promise that can be chained. */
        interface IChainablePromise<T> extends ICancellablePromise<T> {
            /**
             * Chains a promise with a follow-up action and returns a new promise.
             * @param promise The promise to chain.
             * @param continueWith The follow-up action.
             * @returns Returns a chained promise.
             */
            ContinueWith<TOut>(continueWith: (result: T) => TOut): IChainablePromise<TOut>;
            /**
             * Chains a promise with a follow-up action and extends the lifecycle of the current promise.
             * @param promise The promise to chain.
             * @param continueWith The follow-up action that produces another promise.
             * @param merge If the newly produced promise should be merged into the original.
             * @returns Returns a chained promise.
             */
            ContinueWith<TOut>(continueWith: (result: T) => ICancellablePromise<TOut>, merge?: boolean): IChainablePromise<TOut>;
        }
        /**
         * Chains a promise with a follow-up action and returns a new promise.
         * @param promise The promise to chain, or a value T that is to be promised.
         * @param continueWith The follow-up action.
         * @returns Returns a chained promise.
         */
        function Chain<T, TOut>(promise: PromiseLike<T> | T, continueWith: (result: T) => TOut): IChainablePromise<TOut>;
        /**
         * Chains a promise with a follow-up action and returns a new promise.
         * @param promise The promise to chain, or a value T that is to be promised.
         * @param continueWith The follow-up action that produces another promise.
         * @param merge If the newly produced promise should be merged into the original.
         * @returns Returns a chained promise.
         */
        function Chain<T, TOut>(promise: PromiseLike<T> | T, continueWith: (result: T) => ICancellablePromise<TOut>, merge?: boolean): IChainablePromise<TOut>;
        /**
         * Wraps any object into a self-resolving Promise that is chainable. As such, .then() should be the last method to reference.
         * @param obj The objct to wrap.
         * @returns Returns the self-resolving chainable Promise.
         */
        function AsPromise<T>(obj: T): IChainablePromise<T>;
        /**
         * Wraps any object into a Promise that resolves after a given timeout in milliseconds.
         * @param obj The objct to wrap.
         * @param resolveAfter The timeout for the promise to resolve.
         * @returns Returns the chainable Promise.
         */
        function AsPromise<T>(obj: T, resolveAfter: number): IChainablePromise<T>;
        /**
         * Indicates if a given object's instance is a promise.
         * @param obj Tje object to test.
         * @returns Returns if the given object's instance is a promise.
         */
        function IsPromise(obj: any): boolean;
        /**
         * Combines multiple promises into a single promise.
         * @param promises The promises to combine.
         * @returns Returns the overarching promise.
         */
        function CombineAll<T>(promises: PromiseLike<T>[]): IChainablePromise<Array<T>>;
    }
}




export declare namespace Accelatrix {
    class Tasks {
        /** Gets the configuration of the Tasks environment. */
        static get Config(): Tasks.ITasksConfig;
    }
    /** Parallel execution system using Web Workers. */
    namespace Tasks {
        /** The type of source of a script made available to the Tasks engine to be presented to its Web Workers. */
        export enum TaskScriptSource {
            /** URL of the script (must be hosted by the same site due to cross-domain constraints). */
            Url = "Url",
            /** Plain text JavaScript */
            PlainText = "PlainText"
        }
        /** The different methods of passing data to and from Web Workers configured in Accelatrix.Tasks.Config.DataPassingMethod. */
        export enum DataPassingMethod {
            /** Faster, but data loses the type as a clone is used instead. Explictly add a "$type" property to classes to mitigate this shortcoming. */
            Clone = "Clone",
            /** Slower, but preserves type information. */
            TypedSerialization = "TypedSerialization"
        }
        /** The configuration of the Tasks environment. */
        export interface ITasksConfig {
            /** Gets the collection of scripts available to the Tasks engine to be presented to its Web Workers. Use .push() to add more. */
            readonly Scripts: {
                SourceType: Tasks.TaskScriptSource;
                Contents: string;
            }[];
            /** Gets or sets the maximum number of active workers at one given moment. */
            MaxParallelism: number;
            /** How data should be passed to and from Web Workers. */
            DataPassingMethod: DataPassingMethod;
        }
        /** Represents the current stage in the lifecycle of a Task.  */
        export enum TaskStatus {
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
        export class TaskException extends Accelatrix.Exception {
            constructor(message: any);
        }
        /** An AbortException depicting a task cancellation. */
        export class TaskAbortException extends TaskException {
            constructor(message?: string);
        }
        /** An activity in a task. */
        export type TaskActivity<T, TOut> = ((...args: any[]) => TOut | ITask<T, TOut>) | ITask<T, TOut>;
        /** Represents a generic Task. */
        export interface ITask<T, TOut> {
            /** Enqueues a Task in Created status for execution. */
            Start(): Tasks.ITaskPromise<TOut, T>;
            /** Gets the current status of execution. */
            readonly Status: TaskStatus;
            /** Gets the result upon successful completion. */
            readonly Result: TOut;
            /** Gets the exception if the Task has faulted or has been aborted. */
            readonly Exception: Accelatrix.Exception;
            /** Cancels an ongoing execution and throws a new TaskAbortException if the task has started, otherwise, it will quietly resolve without errors. */
            Cancel(): any;
            /**
            * Cancels an ongoing execution and throws the specified exception.
            * @param exception A custom exception to throw instead of a TaskAbortException.
            */
            Cancel(exception?: Accelatrix.Exception): any;
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
                Actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>;
                /** Input arguments passed to the first activity. */
                InputArguments: Array<any>;
            };
        }
        /** A cencellable promise issued by a Task that is being started.. */
        export interface ITaskPromise<TOut, TIn> extends Accelatrix.Async.IChainablePromise<TOut> {
            /** Cancels an ongoing request by raising an AbortException. */
            Cancel(): void;
            /** Attaches a callback to the rejection of the promise. */
            Catch(onrejected: (exception: Accelatrix.Exception) => void): ITaskPromise<TOut, TIn>;
            /** Attaches callbacks for the resolution and/or rejection of the Promise. */
            Then(onfulfilled: (value: TOut) => void): ITaskPromise<TOut, TIn>;
            /** An optional callback to invoke once the request is complete. */
            Finally(callback: (task: ITask<TIn, TOut>) => void): ITaskPromise<TOut, TIn>;
        }
        /** The base implementation of a Task */
        abstract class TaskBase<T, TOut> implements ITask<T, TOut> {
            /**
             * Creates a new TaskBase instance.
             * @param actions A collection of functions that are to be executed sequentially in a chain.
             * @param inputArguments An optional set of initial input arguments to pass onto the first function (any follow-up functions will take as input the output of the previous)
             */
            constructor(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>, inputArguments: {
                0: T;
                [key: number]: any;
            });
            /** Gets the set of activities */
            get Activities(): {
                Actions: Array<(...args: any[]) => TOut | TaskBase<T, TOut>>;
                InputArguments: Array<any>;
            };
            get Status(): TaskStatus;
            /** Gets the result- */
            get Result(): TOut;
            /** Gets the exception if the Task has faulted or has been aborted. */
            get Exception(): Accelatrix.Exception;
            /** Gets if the task has faulted. */
            get IsFaulted(): boolean;
            /** Gets if the task is complete. */
            get IsCompleted(): boolean;
            /** Gets if the task has been Cancelled. */
            get IsCancelled(): boolean;
            /** Gets if the task does not contain an action. */
            get IsActionless(): boolean;
            /** If the task was created within a task. */
            get IsNested(): boolean;
            /** Enqueues a Task in Created status for execution. */
            Start(): Tasks.ITaskPromise<TOut, T>;
            /** Cancels an ongoing execution and throws a new TaskAbortException if the task has started, otherwise, it will quietly resolve without errors. */
            Cancel(): any;
            /**
            * Cancels an ongoing execution and throws the specified exception.
            * @param exception A custom exception to throw instead of a TaskAbortException.
            */
            Cancel(exception?: Accelatrix.Exception): any;
            /** Gets a Promise on which an async caller can await for a result. */
            GetAwaiter(): Tasks.ITaskPromise<TOut, T>;
            /** Cancells all pending or ongoing activities. */
            static CancelAll(): void;
        }
        /**
         * A single-activity Task that is executed in a separate thread.
         * @description Mind to set the Accelatrix.Tasks.Config.Scripts property to present the baseline JS scripts/code segments to be used by Accelatrix.Tasks.\nThe code of Accelatrix will automaticallty be present in the parallelized runtime.
         */
        export class Task<T, TOut> extends TaskBase<T, TOut> {
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The parameterless function to execute and produce a result of T or a subtask of T.
            */
            constructor(action: () => TOut | ITask<T, TOut>);
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The function to execute and produce a result of T or a subtask of T
            * @param arg0 An argument to be passed to the function.
            */
            constructor(action: (arg0: T) => TOut | ITask<T, TOut>, arg0: T);
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The function to execute and produce a result of T or a subtask of T
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            */
            constructor(action: (arg0: T, arg1: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any);
            /**
            * Creates a new Task to be executed in a separate thread.
            * @param action The function to execute and produce a result of T or a subtask of T
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            * @param arg2 A third argument to be passed to the function.
            */
            constructor(action: (arg0: T, arg1: any, arg2: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any, arg2: any);
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            */
            static StartNew<T, TOut>(action: () => TOut | ITask<T, TOut>): Task<T, void>;
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the function.
            */
            static StartNew<T, TOut>(action: (arg0: T) => TOut | ITask<T, TOut>, arg0: T): Task<T, TOut>;
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            */
            static StartNew<T, TOut>(action: (arg0: T, arg1: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any): Task<T, TOut>;
            /**
            * Creates and immediatelly starts a new Task executed in a separate thread.
            * @param action The function or task to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the function.
            * @param arg1 A second argument to be passed to the function.
            * @param arg2 A third argument to be passed to the function.
            */
            static StartNew<T, TOut>(action: (arg0: T, arg1: any, arg2: any) => TOut | ITask<T, TOut>, arg0: T, arg1: any, arg2: any): Task<T, TOut>;
        }
        /** A set of chained sequential activities executed in a separate thread. */
        export class ActivitySet<T, TOut> extends TaskBase<T, TOut> {
            /**
             * Creates a new ActivitySet instance.
             * @param actions An enumeration of functions or Tasks that are to be executed sequentially in a chain.
             */
            constructor(actions: Array<TaskActivity<T, TOut>>);
            /**
             * Creates a new ActivitySet instance.
             * @param actions A collection of functions or Tasks that are to be executed sequentially in a chain.
             * @param inputArguments An optional set of initial input arguments to pass onto the first function (any follow-up functions will take as input the output of the previous)
             */
            constructor(actions: Array<TaskActivity<T, TOut>>, inputArguments: {
                0: T;
                [key: number]: any;
            });
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            */
            static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>): ActivitySet<T, void>;
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            */
            static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0: T): ActivitySet<T, TOut>;
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            */
            static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0: T, arg1: any): ActivitySet<T, TOut>;
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            * @param arg2 A third argument to be passed to the first function.
            */
            static StartNew<T, TOut>(actions: Array<TaskActivity<T, TOut>>, arg0: T, arg1: any, arg2: any): ActivitySet<T, TOut>;
        }
        /** A continuous stream of chained sequential activities executed in a separate thread. The task completes during the first exception, or at the end of the stream. */
        export class ActivityStream<T, TOut> extends TaskBase<T, TOut> {
            /**
             * Creates a new ActivitySet instance.
             * @param actions An enumeration of functions or Tasks that are to be executed sequentially in a chain.
             */
            constructor(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>);
            /**
             * Creates a new ActivitySet instance.
             * @param actions A collection of functions or Tasks that are to be executed sequentially in a chain.
             * @param inputArguments An optional set of initial input arguments to pass onto the first function (any follow-up functions will take as input the output of the previous)
             */
            constructor(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>, inputArguments: {
                0: T;
                [key: number]: any;
            });
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            */
            static StartNew<T, TOut>(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>): ActivityStream<T, void>;
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            */
            static StartNew<T, TOut>(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0: T): ActivityStream<T, TOut>;
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            */
            static StartNew<T, TOut>(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0: T, arg1: any): ActivityStream<T, TOut>;
            /**
            * Creates and immediatelly starts a new ActivitySet executed in a separate thread.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed to the first function.
            * @param arg1 A second argument to be passed to the first function.
            * @param arg2 A third argument to be passed to the first function.
            */
            static StartNew<T, TOut>(actions: Accelatrix.Collections.IEnumerableOps<TaskActivity<T, TOut>>, arg0: T, arg1: any, arg2: any): ActivityStream<T, TOut>;
        }
        /**
         *  A set of parallel activities that jointly collaborate to produce a consolidated result.
         *  The CombinedTask will conclude once all Tasks have successfully completed, or when the first exception is thrown. The OnPartialResult callback provides the means to interrupt the process.
        */
        export class CombinedTask<T, TOut extends Array<TOut>> extends TaskBase<T, TOut> {
            /**
             * Creates a new CombinedTask instance.
             * @param actions An enumeration of functions or Tasks that are to be executed parallely to contribute to a combined result.
             */
            constructor(actions: Array<TaskActivity<T, TOut>>);
            /**
             * Creates a new CombinedTask instance.
             * @param actions An enumeration of functions or Tasks that are to be executed parallely to contribute to a combined result.
             * @param inputArguments An optional set of initial input arguments to pass onto the each member.
             */
            constructor(actions: Array<TaskActivity<T, TOut>>, inputArguments: {
                0: T;
                [key: number]: any;
            });
            /**
             * Allows to subscribe to partial results.
             * @returns  Returns the same CombinedTask instance.
             */
            OnPartialResult(onPartialResult: (result: TOut) => void): CombinedTask<T, TOut>;
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * The Tasks.Config.Scripts static property must have been set once in the session.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            */
            static StartNew<T, TOut extends Array<TOut>>(actions: Array<TaskActivity<T, TOut>>): CombinedTask<T, TOut>;
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed.
            */
            static StartNew<T, TOut extends Array<TOut>>(actions: Array<TaskActivity<T, TOut>>, arg0: T): CombinedTask<T, TOut>;
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed.
            * @param arg1 A second argument to be passed.
            */
            static StartNew<T, TOut extends Array<TOut>>(actions: Array<TaskActivity<T, TOut>>, arg0: T, arg1: any): CombinedTask<T, TOut>;
            /**
            * Creates and immediatelly starts a new CombinedTask executed parallely in separate threads.
            * @param actions The set of functions or tasks to execute and produce a result of T or a subtask of T.
            * @param arg0 An argument to be passed.
            * @param arg1 A second argument to be passed.
            * @param arg2 A third argument to be passed.
            */
            static StartNew<T, TOut extends Array<TOut>>(actions: Array<TaskActivity<T, TOut>>, arg0: T, arg1: any, arg2: any): CombinedTask<T, TOut>;
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
        export class StatefulActivity<T> extends Function {
            constructor();
            /** Gets the unique id of the current StatefulActivity instance. */
            get Id(): string;
            /** Reads the dataset stored in the StatefulActivity. */
            Read(): StatefulActivity<Array<T>>;
            /** Concacts the current data with the dataset stored in the StatefulActivity. */
            ConcatRead(): StatefulActivity<Array<T>>;
            /**
             * Reads the dataset stored in the StatefulActivity and pushes an additional set.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             */
            ReadAndPush<TOut>(dataTransform: (data: T) => TOut): StatefulActivity<Array<T>>;
            /**
             * Pushes additional state into the StatefulActivity.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             */
            Push<TOut>(dataTransform: (data: T) => TOut): StatefulActivity<T>;
            /**
             * Discards any existing data already pushed into the StatefulActivity by setting its value.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             */
            Set<TOut>(dataTransform: (data: T) => TOut): StatefulActivity<T>;
            /**
             * Pushes additional state into the StatefulActivity and evaluates the state to produce a follow-up action to apply only on the untransformed state being pushed.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             * @param evaluator The function that receives the existing state and the new delta being pushed and produces a follow-up action to be applied to the original data being pushed before transformation.
             */
            PushAndEvaluate<TOut>(dataTransform: (data: T) => TOut, evaluator: (accumulatedData: Array<TOut>, newData: TOut, statefulActivityId?: string) => ((data: T) => any)): StatefulActivity<T>;
            /**
             * In a continuous manner, pushes additional state into the StatefulActivity as a buffer and evaluates the state to produce a follow-up action to apply only on the untransformed state being pushed.
             * @param dataTransform An optional function to transform the data received into the data being pushed into the state, for example, pushing the .GetHashCode() of the data instead of the data itself for faster performance.
             * @param evaluator The function that receives the existing state and the new delta being pushed and produces a follow-up action to be applied to to the original data being pushed before transformation.
             * @param bufferSize How many elements are to be submitted during each push and evaluation cycle.
             */
            StreamPushAndEvaluate<TOut>(dataTransform: (data: T) => TOut, evaluator: (accumulatedData: Array<TOut>, newData: TOut, statefulActivityId?: string) => ((data: T) => any), bufferSize?: number): StatefulActivity<T>;
            /** Frees up any resources consumed by the current StatefulActivity, typically called during the .Finally() callback of a CombinedTask. */
            Dispose(): void;
            toJSON(): any;
        }
        export {};
    }
    namespace Collections {
        /** Enumerable operations in enumerations. */
        interface IEnumerableOps<T> extends Accelatrix.Collections.IEnumerableOps<T> {
            /**
             * Iterates through each element in the enumeration and executes an action in a separate task.
             * @param action The action to execute.
             */
            ForAll<TOut>(action: (element: T, index?: number) => TOut): Accelatrix.Async.IChainablePromise<TOut>;
        }
    }
}








export declare namespace Accelatrix {
    namespace Collections {
        /** An enumeration that runs in parallel. */
        interface IEnumerableAsyncOps<T> extends Accelatrix.Collections.IEnumerable<T> {
            /** Freezes the current enumeration so that the position of the iterator is retained during subsquent calls. */
            Freeze(): IEnumerableAsyncOps<T>;
            /** Wraps the enumeration. */
            ToEnumerable(): IEnumerableAsyncOps<IEnumerableAsyncOps<T>>;
            /** Gets if the sequence contains any elements. */
            Any(): Accelatrix.Async.IChainablePromise<boolean>;
            /** Gets if the sequence does not contain any elements. */
            NotAny(): Accelatrix.Async.IChainablePromise<boolean>;
            /** If a given element exists within the enumeration. */
            Contains(element: T | PromiseLike<T>): Accelatrix.Async.IChainablePromise<boolean>;
            /** If a given element does not exist within the enumeration. */
            NotContains(element: T | PromiseLike<T>): Accelatrix.Async.IChainablePromise<boolean>;
            /** Gets the first element of a sequence, or null if empty, but the order is random and not necessarily the order at input. */
            FirstOrNull(): Accelatrix.Async.IChainablePromise<T>;
            /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
            LastOrNull(): Accelatrix.Async.IChainablePromise<T>;
            /**
            * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
            * @param keySelector A function to extract the key from each element.
            * @param valueSelector A function to extract the value from each element.
            */
            ToDictionary<TKey, TOut>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix.Collections.IHashMap<TKey, TOut>;
            /** Commits an enumeration as a typed list and gives the count of memebers. */
            Count(): Accelatrix.Async.IChainablePromise<number>;
            /**
            * Sums all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Sum(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): Accelatrix.Async.IChainablePromise<number | Accelatrix.IQuantity<Accelatrix.IUnit>>;
            /**
            * Averages all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Average(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): Accelatrix.Async.IChainablePromise<number | Accelatrix.IQuantity<Accelatrix.IUnit>>;
            /**
            * Max of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Max(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): Accelatrix.Async.IChainablePromise<number | Accelatrix.IQuantity<Accelatrix.IUnit>>;
            /**
            * Min of all quantitative items in the collection.
            * @param selector An optional selector to extract only the quantitative elements of the collection.
            */
            Min(selector?: (element: T, index?: number) => number | Accelatrix.IQuantity<Accelatrix.IUnit>): Accelatrix.Async.IChainablePromise<number | Accelatrix.IQuantity<Accelatrix.IUnit>>;
            /**
             * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
             * @param typeConstructor The type constructor, e.g. the reference to the class definition.
             */
            OfType<TFilter extends T>(typeConstructor: {
                new (...args: any[]): TFilter;
            }): IEnumerableAsyncOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param type The Accelatrix.Type of the type to filter.
             */
            OfType<TFilter extends T>(type: Accelatrix.Type): IEnumerableAsyncOps<TFilter>;
            /**
             * Filters members based on their type.  Type inheritance is taken into account.
             * @param typeName The name or full name of the type.
             */
            OfType<TFilter extends T>(typeName: string): IEnumerableAsyncOps<TFilter>;
            /** Commits an enumeration as a typed list. */
            ToList(): Accelatrix.Async.IChainablePromise<Accelatrix.Collections.IEnumerableOps<T>>;
            /**
            * Concatenates one sequence after the existing.
            *
            * @param second The second enumeration.
            */
            Concat(second: Accelatrix.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T> | PromiseLike<Accelatrix.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>>): IEnumerableAsyncOps<T>;
            /**
            * Projects each element of a sequence into a new form.
            * @param selector The projection function.
            */
            Select<TOut>(selector: (element: T, index?: number) => TOut | PromiseLike<T>): IEnumerableAsyncOps<TOut>;
            /**
            * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children).
            * @param selector The projection function.
            */
            SelectMany<TOut>(selector: (element: T, index?: number) => Accelatrix.Collections.IEnumerableOps<TOut>): IEnumerableAsyncOps<TOut>;
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
            GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerableAsyncOps<Accelatrix.Collections.IGrouping<TIn, T>>;
            /**
            * Produces the intersection of two sequences.
            * @param sequence The sequence to intersect.
            */
            Intersect(sequence: Accelatrix.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;
            /**
            * Produces the exclusion of elements from a sequence.
            * @param sequence The sequence to subtract.
            */
            Except(sequence: Accelatrix.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;
            /**
            * Produces the set union of two sequences by using the default equality comparer.
            * Different from Concat since only distinct members of the second sequence will end up in the new enumeration.
            * @param sequence The sequence to union.
            */
            Union(sequence: Accelatrix.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;
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
            Zip<TSecond, TOut>(second: Accelatrix.Collections.IEnumerableOps<TSecond> | IEnumerableAsyncOps<TSecond>, resultSelector?: (element: T, second: TSecond, index?: number) => TOut | PromiseLike<TOut>): IEnumerableAsyncOps<TOut>;
            /**
            * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
            * @param second The second enumeration to interleave with.
            */
            Interleave(second: Accelatrix.Collections.IEnumerableOps<T> | IEnumerableAsyncOps<T>): IEnumerableAsyncOps<T>;
            /**
            * Creates a HashMap from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
            * @param keySelector A function to extract the key from each element.
            * @param valueSelector A function to extract the value from each element.
            */
            ToDictionary<TKey, TOut extends IEnumerableAsyncOps<any>>(keySelector: (element: T, index?: number) => TKey, valueSelector: (element: T, index?: number) => TOut): Accelatrix.Collections.IHashMap<TKey, Accelatrix.Collections.IEnumerableOps<TOut>>;
        }
        /** An enumeration that can cope with async members. */
        const AsyncEnumerable: {
            new <T>(arg: Accelatrix.Collections.IEnumerableOps<T | PromiseLike<T>> | IEnumerableAsyncOps<T> | (() => IterableIterator<T | Promise<T>>)): Accelatrix.Collections.Enumerable<T> & IEnumerableAsyncOps<T>;
        };
    }
}






declare global {
    export interface Array<T> {
        /**
        * Creates a new enumeration that is handled in Web Workers.
        * The Tasks.Config.Scripts static property must have been set once in the session to present the baseline JS scripts/code segments to be used by tasks. Ensure that the scripts or code pertaining to Base.js, Object.js, Linq.js and Tasks.js are always included.
        */
        AsParallel: () => Accelatrix.Collections.IEnumerableAsyncOps<T>;
    }
}
export declare namespace Accelatrix {
    /** Operations for enumerations. */
    interface IEnumerable<T> {
        /**
        * Creates a new enumeration that is handled in Web Workers.
        * The Tasks.Config.Scripts static property must have been set once in the session to present the baseline JS scripts/code segments to be used by tasks. Ensure that the scripts or code pertaining to Base.js, Object.js, Linq.js and Tasks.js are always included.
        */
        AsParallel: () => Accelatrix.Collections.IEnumerableAsyncOps<T>;
    }
}
export declare namespace Accelatrix {
    namespace Collections {
        interface IteratorResult<T> {
            done: boolean;
            value: T;
        }
        interface Iterator<T> {
            next(value?: any): IteratorResult<T>;
            return?(value?: any): IteratorResult<T>;
            throw?(e?: any): IteratorResult<T>;
        }
        interface IterableIterator<T> extends Iterator<T> {
        }
        /** A cancellable promise issued by a ParallelQuery's GetAwaiter(). */
        export interface IParallelQueryPromise<T> extends Accelatrix.Async.IChainablePromise<T> {
            /** Allows to subscribe to partial results. */
            OnPartialResult(onPartialResult: (result: T) => void): IParallelQueryPromise<T>;
        }
        /** An enumeration that runs in parallel. */
        export const ParallelQuery: {
            new <T>(arg: Array<T> | Accelatrix.Collections.IEnumerableOps<T> | (() => IterableIterator<T>)): Accelatrix.Collections.IEnumerableAsyncOps<T>;
        };
        export {};
    }
}
