declare global {
    export interface Object {
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
    export interface ObjectConstructor extends Object {
        /**
         * Compares two objects from equatability.
         * @param first The first object to compare.
         * @param second The object to compare against.
         */
        AreEqual(first: any, second: any): boolean;
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    export const Version = "1.0.0";
    class Exception extends Error {
        /** Gets the message of the exception. */
        get Message(): string;
    }
    /** An exception to be raised when a null argument passed onto a function is deemed as unexpected. */
    export class ArgumentNullException extends Exception {
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
    export class ArgumentException extends Exception {
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
    /**
     * Decorator to mark and make classes immutable.
     * This will prevent any changes to be conducted to the class and persist its .GetHashCode().
     * @param constructor The class constructor.
     * @returns Returns the modified class constructor.
     */
    export function ImmutableObject<T extends {
        new (...args: any[]): {};
    }>(constructor: T): T;
    export namespace ImmutableObject {
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
    export {};
}


declare global {
    export interface String {
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
         * Gets all Types that match a specified name ordered by best match.
         * @param typeName The name of the type to retrieve.
         * @returns Returns all Types that match a specified name ordered by best match.
         */
        static FromName(typeName: string): Array<Type>;
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
            ToString(): string;
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
    export interface Number {
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
    export interface IUnit {
        /** The code of the unit, e.g. EUR. */
        Code: string;
        /** The given name of the unit, e.g. European Union Euro. */
        Name?: string;
        /** The short name, e.g. €. */
        ShortName?: string;
    }
    /** A generic quantity with a unit. */
    export interface IQuantity<T extends IUnit> {
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
    export abstract class Quantity<T extends IUnit> implements IQuantity<IUnit> {
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
    namespace Accelatrix {
        class ArgumentNullException {
            constructor(message: string, argumentName?: string);
        }
        class ArgumentException {
            constructor(message: string, argumentName?: string);
        }
        function ImmutableObject<T extends {
            new (...args: any[]): {};
        }>(constructor: T): T;
        namespace ImmutableObject {
            /**
             * Makes an object immutable by freezing it and persisting its GetHashCode().
             * @param obj The object to freeze.
             * @param propagate If the children should be frozen as well.
             */
            const Freeze: (obj: object, propagate?: boolean) => void;
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
            /**
             * Formats a number as string according to the specific ILocaleFormatInfo.
             * @param number The number to format.
             * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
             * @param numberFormatSimplification If the number should be simplified, e.g. 1.1K, 2.2M.
             * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
             * @returns Returns the specified number as a formatted string.
             */
            function FormatNumber(number: number, precision?: number, numberFormatSimplification?: any, formats?: ILocaleFormatInfo): string;
        }
    }
    export {};
}



import { Accelatrix } from './Globalization';
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




import { Accelatrix as Accelatrix_Type } from "./Type";
declare global {
    /** Array as IEnumerable. */
    export interface Array<T> extends Accelatrix.IEnumerable<T> {
    }
    export interface ObjectConstructor extends Object {
        /**
        * Flattens a hierarchy contained within an object into a single sequence, e.g. myHierarchy.FlattenHierarchy(z => z.Children).
        * @param obj The root object to flatten.
        * @param childEnumerator The predicate that given one element retrieves the list of children.
        */
        FlattenHierarchy<T>(obj: Object, childEnumerator: (item: T) => Accelatrix.IEnumerable<T>): Accelatrix.IEnumerable<T>;
    }
}
/** Accelatrix namespace. */
export declare namespace Accelatrix {
    /** Supports a simple iteraction over an enumeration of a specified type. */
    export interface IEnumerator<T> {
        /** Gets the element in the enumeration at the current position. */
        Current: T;
        /** Advances the enumerator to the next element of the enumeration and indicates if the operation was successfull. */
        MoveNext: () => boolean;
        /** Sets the enumerator to its initial position, which is before the first element. */
        Reset: () => void;
    }
    /**
    * A generic typed enumeration.
    */
    export interface IEnumerable<T> extends IEnumerableOps<T> {
        /** Gets the enumerator to iterate through the enumeration. */
        GetEnumerator(): IEnumerator<T>;
    }
    /** A grouped enumeration.  */
    export interface IGrouping<TKey, T> extends IEnumerable<T> {
        Key: TKey;
    }
    /** Operations for enumerations. */
    interface IEnumerableOps<T> {
        /**
         * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
         * @param typeConstructor The type constructor, e.g. the reference to the class.
         */
        OfType<TFilter extends T>(typeConstructor: {
            new (...args: any[]): TFilter;
        }): IEnumerable<TFilter>;
        /**
         * Filters members based on their type.  Type inheritance is taken into account.
         * @param type The Accelatrix.Type of the type to filter.
         */
        OfType<TFilter extends T>(type: Accelatrix_Type.Type): IEnumerable<TFilter>;
        /**
         * Filters members based on their type.  Type inheritance is taken into account.
         * @param typeName The name or full name of the type.
         */
        OfType<TFilter extends T>(typeName: string): IEnumerable<TFilter>;
        /**
        * Gets if the sequence contains any elements.
        */
        Any(): boolean;
        /** Commits an enumeration as a typed list. */
        ToList(): Array<T>;
        /** Iterates through each element in the enumeration and executes an action. The loop can be halted if the action returns false. */
        ForEach(action: (element: T, index?: number) => boolean | void | any): void;
        /**
        * Concatenates one sequence after the existing.
        *
        * @param second The second enumeration.
        */
        Concat(second: IEnumerable<T>): IEnumerable<T>;
        /**
        * Projects each element of a sequence into a new form.
        * @param selector The projection function.
        */
        Select<TOut>(selector: (element: T, index?: number) => TOut): IEnumerable<TOut>;
        /**
        * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children).
        * @param selector The projection function.
        */
        SelectMany<TOut>(selector: (element: T, index?: number) => IEnumerable<TOut>): IEnumerable<TOut>;
        /**
        * Filters a sequence of values based on a predicate.
        * @param selector The selector function.
        */
        Where(selector: (element: T, index?: number) => boolean): IEnumerable<T>;
        /**
        * Finds all elements in a collection.
        * @param what The element to find.
        * @param equalityComparer An optional equatability comparer. If none is specified, the default is used as in the Where implementation.
        */
        Find(what: T, equalityComparer?: (first: T, second: T) => boolean): IEnumerable<T>;
        /** Gets the first element of a sequence, or null if empty. */
        FirstOrNull(): T;
        /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
        LastOrNull(): T;
        /** Produces a new enumeration in reverse order, which implies that the enumeration is finite. */
        Reverse(): Array<T>;
        /** Gets all entries which are not null, and in string enumerations, not empty. */
        NotNullOrEmpty(): IEnumerable<T>;
        /** If a given element exists within the collection. */
        Contains(element: T): boolean;
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
        Distinct(equalityComparer?: (a: T, b: T) => boolean): IEnumerable<T>;
        /** Takes elements of a sequence until a duplicate is found, which relies on Equals(). */
        TakeWhileDistinct(): IEnumerable<T>;
        /** Skips elements of a sequence until a duplicate is found, which relies on Equals(). */
        SkipWhileDistinct(): IEnumerable<T>;
        /**
        * Groups the items in a collection based, and produces a map/dictionary where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
        * @param keySelector The group by criterion.
        */
        GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerable<IGrouping<TIn, T>>;
        /**
        * Groups the items in a collection based on a key and its sequence, and produces an enumeration where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
        * There may be groups with the same key depending on their order in the enumeration.
        * @param keySelector The group by criterion.
        */
        GroupByConsecutive<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerable<IGrouping<TIn, T>>;
        /**
        * Produces the intersection of two sequences.
        * @param sequence The sequence to intersect.
        */
        Intersect(sequence: IEnumerable<T>): IEnumerable<T>;
        /**
        * Produces the exclusion of elements from a sequence.
        * @param sequence The sequence to subtract.
        */
        Except(sequence: IEnumerable<T>): IEnumerable<T>;
        /**
        * Removes an element or set of elements based on a selector from the collection.
        * @param selector The element to remove, or a Where condition matching the elements to be removed.
        */
        Remove(selector: (element: T, index?: number) => boolean | T): IEnumerable<T>;
        /**
        * Produces the set union of two sequences by using the default equality comparer.
        * Different from Concat since only distinct members of the second sequence will end up in the new enumeration.
        * @param sequence The sequence to union.
        */
        Union(sequence: IEnumerable<T>): IEnumerable<T>;
        /**
        * Bypasses a specified number of contiguous elements from the start of the sequence.
        * @param count The number of elements to bypass.
        */
        Skip(count: number): IEnumerable<T>;
        /**
        * Returns a specified number of contiguous elements from the start of the sequence.
        * @param count The number of elements to take.
        */
        Take(count: number): IEnumerable<T>;
        /**
        * Skips the collection while a condition is tru.
        * @param condition The condition that while true will skip the member.
        */
        SkipWhile(condition: (member: T) => boolean): IEnumerable<T>;
        /**
        * Returns a specified number of contiguous elements from the start of the sequence.
        * @param condition The selector of elements to take.
        */
        TakeWhile(condition: (item: T) => boolean): IEnumerable<T>;
        /**
        * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
        * @param second The sequence to zip.
        * @param resultSelector The predicate that joins an element of T and another of Tsecond and creates a TOut.
        */
        Zip<TSecond, TOut>(second: IEnumerable<TSecond>, resultSelector?: (element: T, second: TSecond, index?: number) => TOut): IEnumerable<TOut>;
        /**
        * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
        * @param second The second enumeration to interleave with.
        */
        Interleave(second: IEnumerable<T>): IEnumerable<T>;
        /**
        * Creates a dictionary from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
        * A JavaScript Object is, by definition, a Dictionary.
        * @param keySelector A function to extract the key from each element.
        * @param valueSelector A function to extract the value from each element.
        */
        ToDictionary<TOut>(keySelector: (element: T, index?: number) => string, valueSelector: (element: T, index?: number) => TOut): {
            [key: string]: TOut;
        };
        /**
        * Sums all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Sum(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Averages all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Average(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Max of all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Max(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Min of all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Min(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
    }
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
    export class Enumerable<T> implements IEnumerable<T> {
        /**
        * Creates a new Enumeration based on an generator.
        * @param iterator The generator.
        */
        constructor(generator: () => IterableIterator<T>);
        /**
        * Creates a new Enumeration based on an existing Array.
        * @param array The array to enumerate.
        */
        constructor(array: Array<T>);
        /**
        * Creates a new Enumeration based on an existing IEnumerable.
        * @param enumeration The enumerations.
        */
        constructor(enumeration: IEnumerable<T>);
        /** Gets the enumerator to iterate through the enumeration. */
        GetEnumerator(): IEnumerator<T>;
        /**  Gets if the sequence contains any elements. */
        Any(): boolean;
        /** Commits the enumeration and gets its count. */
        private get length();
        /** Gets the first element, or null, if not present. */
        private get 0();
        /** Commits the enumeration and gets the second element, or null, if not present. */
        private get 1();
        /** Convertion to JSON. */
        toJSON(): Array<T>;
        /** Runs through the enumeration to produce a typed list. */
        ToList(): Array<T>;
        /** Commits the enumeration and gets its length. */
        Count(): number;
        /** Commits the enumeration as an array. */
        private ToArray;
        /** Iterates through each element in the enumeration and executes an action. The loop can be halted if the action returns false. */
        ForEach(action: (element: T, index?: number) => boolean | void | any): void;
        /**
         * Filters members based on their type and provides a typed result. Type inheritance is taken into account.
         * @param typeConstructorOrType The type constructor, e.g. the reference to the class, or the Accelatrix.Type of the type to filter.
         */
        OfType<TFilter extends T>(typeConstructorOrType: {
            new (...args: any[]): TFilter;
        } | Accelatrix_Type.Type | string): IEnumerable<TFilter>;
        /**
        * Projects each element of a sequence into a new form.
        *
        * @param selector The projection function.
        */
        Select<TOut>(selector: (element: T, index?: number) => TOut): IEnumerable<TOut>;
        /**
        * Concatenates one sequence after the existing.
        *
        * @param second The second enumeration.
        */
        Concat(second: IEnumerable<T>): IEnumerable<T>;
        /**
        * Projects each element of a sequence into an sequence and flattens the resulting sequence into one sequence, e.g. myCollection.SelectMany(z => z), or myCollection.SelectMany(z => z.Children)
        *
        * @param selector The projection function.
        */
        SelectMany<TOut>(selector: (element: T, index?: number) => IEnumerable<TOut>): IEnumerable<TOut>;
        /**
         * Filters a sequence of values based on a predicate.
         * @param selector The filter predicate.
         */
        Where(selector: (element: T, index?: number) => boolean): IEnumerable<T>;
        /**
        * Finds all elements in a collection.
        * @param what The element to find.
        * @param equalityComparer An optional equatability comparer. If none is specified, the default is used as in the Where implementation.
        */
        Find(what: T, equalityComparer?: (first: T, second: T) => boolean): IEnumerable<T>;
        /** Gets the first element of a sequence, or null if empty. */
        FirstOrNull(): T;
        /** Gets the last element of a sequence, which implies that the enumeration is finite, or null if empty. */
        LastOrNull(): T;
        /** Produces a new enumeration in reverse order, which implies that the enumeration is finite. */
        Reverse(): Array<T>;
        /** Gets all entries which are not null, and in string enumerations, not empty. */
        NotNullOrEmpty(): IEnumerable<T>;
        /** If a given element exists within the enumeration. */
        Contains(element: T): boolean;
        private static OrdinalComparer;
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
        Distinct(equalityComparer?: (a: T, b: T) => boolean): IEnumerable<T>;
        /** Takes elements of a sequence until a duplicate is found, which relies on Equals(). */
        TakeWhileDistinct(): IEnumerable<T>;
        /** Skips elements of a sequence until a duplicate is found, which relies on Equals(). */
        SkipWhileDistinct(): IEnumerable<T>;
        /**
        * Groups the items in a collection based, and produces a map/dictionary where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
        * @param keySelector The group by criterion.
        */
        GroupBy<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerable<IGrouping<TIn, T>>;
        /**
         * Groups the items in a collection based on a key and its sequence, and produces an enumeration where the key is the group and the value is a collection of the members that satisfy the key selector criteria.
         * There may be groups with the same key depending on their order in the enumeration.
         * @param keySelector The group by criterion.
         */
        GroupByConsecutive<TIn>(keySelector: (element: T, index?: number) => TIn): IEnumerable<IGrouping<TIn, T>>;
        /**
        * Produces the intersection of two sequences.
        * @param sequence The sequence to intersect.
        */
        Intersect(sequence: IEnumerable<T>): IEnumerable<T>;
        /**
        * Produces the exclusion of elements from a sequence.
        * @param sequence The sequence to subtract.
        */
        Except(sequence: IEnumerable<T>): IEnumerable<T>;
        /**
        * Removes an element or set of elements based on a selector from the collection.
        * @param selector The element to remove, or a Where condition matching the elements to be removed.
        */
        Remove(selector: (element: T, index?: number) => boolean | T): IEnumerable<T>;
        /**
        * Produces the set union of two sequences by using the default equality comparer.
        * Different from Concat since only distinct members of the second sequence will end up in the new enumeration.
        *
        * @param sequence The sequence to union.
        */
        Union(sequence: IEnumerable<T>): IEnumerable<T>;
        /**
        * Bypasses a specified number of contiguous elements from the start of the sequence.
        *
        * @param count The number of elements to bypass.
        */
        Skip(count: number): IEnumerable<T>;
        /**
        * Returns a specified number of contiguous elements from the start of the sequence.
        *
        * @param count The number of elements to take.
        */
        Take(count: number): IEnumerable<T>;
        /**
        * Skips the collection while a condition is tru.
        * @param condition The condition that while true will skip the member.
        */
        SkipWhile(condition: (member: T) => boolean): IEnumerable<T>;
        /**
        * Returns a specified number of contiguous elements from the start of the sequence.
        * @param condition The selector of elements to take.
        */
        TakeWhile(condition: (item: T) => boolean): IEnumerable<T>;
        /**
        * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
        *
        * @param second The sequence to zip.
        *
        * @param resultSelector The predicate that joins an element of T and another of Tsecond and creates a TOut.
        */
        Zip<Tsecond, TOut>(second: IEnumerable<Tsecond>, resultSelector?: (element: T, second: Tsecond, index?: number) => TOut): IEnumerable<TOut>;
        /**
        * Interleaves two sequences - creates a single sequence from the elements of two lists arranged in an alternate way.
        * @param second The second enumeration to interleave with.
        */
        Interleave(second: IEnumerable<T>): IEnumerable<T>;
        /**
        * Creates a dictionary from a sequence according to a specified key selector function. e.g. myPerson.ToDictionary(z => z.Id, w => w).
        * A JavaScript Object is, by definition, a Dictionary.
        * @param keySelector A function to extract the key from each element.
        * @param valueSelector A function to extract the value from each element.
        */
        ToDictionary<Tout>(keySelector: (element: T, index?: number) => string, valueSelector: (element: T, index?: number) => Tout): {
            [key: string]: Tout;
        };
        /**
        * Sums all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Sum(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Averages all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Average(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Max of all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Max(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Min of all quantitative items in the collection.
        * @param selector An optional selector to extract only the quantitative elements of the collection.
        */
        Min(selector?: (element: T, index?: number) => number | IQuantity<IUnit>): number | IQuantity<IUnit>;
        /**
        * Creates a sequence of numbers.
        * @param start The first position of the sequence.
        * @param count The number of items in the sequece. If none is specified, the sequence will be infinite.
        */
        static Range(start: number, count?: number): IEnumerable<number>;
    }
    export {};
}
