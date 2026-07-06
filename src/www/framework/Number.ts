/// <reference path="./Base.ts" />
/// <reference path="./String.ts" />

import { Accelatrix as Accelatrix_Base } from "./Base";
import { Accelatrix as Accelatrix_Globalization } from "./Globalization";

declare global
{
    /** Number definition. */
    export interface Number extends ITypeSystem
    {
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
        ToString(precision? : number, formatting?: ILocaleFormatInfo): string;

        /**
         * Culture-aware parsing of number.
         * @param number  The culture-sensitive string to parse into a number.
         */
        Parse(number: string): number;
    }

    /** Number definition. */
    export interface NumberConstructor extends Number
    {
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
    interface ILocaleFormatInfo
    {
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
export namespace Accelatrix
{  
    /** Represents a unit of an IQuantity. */
    export interface IUnit
    {
      /** The code of the unit, e.g. EUR. */
      Code: string;

      /** The given name of the unit, e.g. European Union Euro. */
      Name?: string;

      /** The short name, e.g. €. */
      ShortName?: string;        
    }

    /** A generic quantity with a unit. */
    export interface IQuantity<T extends IUnit>
    {
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
    export abstract class Quantity<T extends IUnit> implements IQuantity<IUnit>
    {
        /**
         * Createa a new Quantity intance.
         * @param amount The amount in full precision.
         * @param unit The unit or its string representation.
         */
        protected constructor(amount: number, unit: T | string)
        /**
         * Createa a new Quantity intance.
         * @param amount The amount in full precision.
         * @param unit The unit or its string representation.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        protected constructor(amount: number, unit: T | string, precision: number | undefined | null)
        protected constructor(amount: number, unit: T | string, precision?: number | undefined | null)
        {
            if (amount == null) throw new Accelatrix_Base.ArgumentNullException("amount");
            if (isNaN(Number(amount))) throw new  Accelatrix_Base.ArgumentException("'amount' needs to be a number.");
            if (unit == null || String.IsNullOrWhiteSpace(unit.toString())) throw new  Accelatrix_Base.ArgumentNullException("unit");
            if (isNaN(Number(precision))) precision = null;

            let myUnit = unit.GetType().Name != "String"
                         ? unit as T
                         : new NumberSystem.Unit(unit.toString());

            amount = Number(amount);
            precision = precision == null ? null : Number(precision);

            Object.defineProperty(this, "Amount", { get: () => amount, enumerable: true });
            Object.defineProperty(this, "Unit", { get: () => myUnit, enumerable: true });
            Object.defineProperty(this, "Precision", { get: () => precision, enumerable: true });

            var me = this as any;
            Object.defineProperty(this, "ToString",
            { 
                value: (formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo | undefined) => Quantity.Format(me, formatting),
                enumerable: false,
                configurable: true,
            });
        }

        /** Gets the full precision numeric amount.*/        
        public get Amount(): number
        { 
            return null as any;  
        }

        /** Gets the unit of the amount. */
        public get Unit(): T
        { 
            return null as any;
        }
        
        /** 
         * Gets the precision used for representation as a power of 10.
         * Null means that the amount is to be presented in full precision.
         * 0 or 1 means that the amount should be displayed without decimals,
        */
        public get Precision(): number
        { 
            return null as any;    
        }     

        /**
         * Adds a number or quantity to the current number and produces a new number instance.
         * @param operands  A single number, or a single quantity, or a collection of numbers, or a collection of quantities.         
         */        
        public Add(operands: number | IQuantity<IUnit> | Array<number | IQuantity<IUnit>>): IQuantity<IUnit>
        {
            if (operands == null) return this;

            let allOperands = !operands.GetType().IsArray
                              ? [ this, operands as number | IQuantity<T> ]
                              : [ this as number | IQuantity<IUnit>].concat(operands as Array<number | IQuantity<IUnit>>);

           return Quantity.Add(allOperands as any);
        }
        
        /**
         * Indicates if a given object is an IQuantity or a number.
         * @param obj The object to test.
         */
        public static IsQuantity(obj: any): boolean
        {
            if (obj == null) return false;
            if (obj.GetType().Name == "Number") return true;
            if (isNaN(obj["Amount"])) return false;
            if (obj["Unit"] == null) return false;
            if (obj["Unit"]["Code"] == null
                && obj["Unit"]["Name"] == null
                && obj["Unit"]["ShortName"] == null)
                return false;

            return true;
        }

        /**
         * Gets the culture-aware string representation of a Quantity according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.
         * @param quantity The quantity to format.
         */
        public static Format(quantity: IQuantity<IUnit>): string
        /**
         * Gets the culture-aware string representation of a Quantity according to the specified ILocaleFormatInfo.
         * @param quantity The quantity to format.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        public static Format(quantity: IQuantity<IUnit>, formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo | undefined): string
        /**
         * Gets the culture-aware string representation of a Quantity according to the specified ILocaleFormatInfo.
         * @param quantity The quantity to format.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        public static Format(quantity: IQuantity<IUnit>, formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo | undefined): string
        {
            if (quantity == null) return "";

            let unitString = quantity.Unit == null
                             ? ""
                             : Object.getOwnPropertyDescriptor(quantity.Unit, "ToString") != null
                               ? quantity.Unit.ToString()
                               : quantity.Unit.Code != null && quantity.Unit.Code.trim().length > 0
                                  ? quantity.Unit.Code
                                  : quantity.Unit.ShortName != null && quantity.Unit.ShortName.trim().length > 0
                                    ? quantity.Unit.ShortName
                                    : quantity.Unit.Name == null
                                       ? ""
                                       : quantity.Unit.Name;

            return quantity.Unit == null
                    ? Accelatrix_Globalization.Globalization.FormatNumber(quantity.Amount, quantity.Precision == null ? 100 : quantity.Precision, null, formatting)
                    : unitString.length <= 1 && (quantity.Unit.Name == null || quantity.Unit.Name.length == 0)
                        ? Accelatrix_Globalization.Globalization.FormatNumber(quantity.Amount, quantity.Precision == null ? 100 : quantity.Precision, null, formatting) + unitString
                        : Accelatrix_Globalization.Globalization.FormatNumber(quantity.Amount, quantity.Precision == null ? 100 : quantity.Precision, null, formatting) + " " + unitString;
        }

        /**
         * Adds a collection of quantities.
         * @param operands A collection of numbers or quantities.
         */
        public static Add<Tin extends IUnit>(operands: Array<number | IQuantity<Tin>>): IQuantity<Tin>
        {
            if (operands == null || operands.length == 0) return null as any;
            
            let arithmetcResult = (0).Add(operands as Array<number>);

            if (arithmetcResult == null) return null as any; // different units           

            let template: (IQuantity<IUnit>) | null = null;

            for (var i = 0; i < operands.length; i++)
                if (Quantity.IsQuantity(operands[i]))
                {
                    if (template == null || (operands[i] as any as IQuantity<IUnit>).Precision > template.Precision)
                        template = operands[i] as any as IQuantity<IUnit>;
                }

            if (template == null || template.GetType().Name == "Number")
                return Quantity.Unitless(arithmetcResult) as any as IQuantity<Tin>;

            let proxy = JSON.parse(JSON.stringify(template));
            proxy.Amount = arithmetcResult;
            proxy.Unit = template.Unit;
            proxy.Precision = template.Precision;

            try
            {
                return template.GetType().CreateNewInstance(proxy) as any;
            }
            catch(ex)
            {
                //return Quantity.Generic(arithmetcResult, template.Unit, template.Precision);
                Object["UnboxDates"](proxy);
                return proxy as IQuantity<Tin>;
            }
        }

        /**
         * Creates a new generic immutable quantity.
         * @param amount The amount.
         * @param unit The unit or its name.
         */
        public static Generic<TUnit extends IUnit>(amount: number, unit: TUnit | string): IQuantity<IUnit>
        /**
         * Creates a new generic immutable quantity.
         * @param amount The amount.
         * @param unit The unit or its name.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        public static Generic<TUnit extends IUnit>(amount: number, unit: TUnit | string, precision: number): IQuantity<IUnit>
        public static Generic<TUnit extends IUnit>(amount: number, unit: TUnit | string, precision?: number): IQuantity<IUnit>
        {
            return new NumberSystem.GenericQuantity(amount, unit, precision);
        }

        /**
         * Creates a new immutable percentage.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         */        
        public static Percentage<TUnit extends IUnit>(amount: number): IQuantity<IUnit>
        /**
         * Creates a new immutable percentage.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        public static Percentage<TUnit extends IUnit>(amount: number, precision: number): IQuantity<IUnit>
        /**
         * Creates a new immutable percentage.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */        
        public static Percentage<TUnit extends IUnit>(amount: number, precision?: number): IQuantity<IUnit>
        {
            return new NumberSystem.Percentage(amount, precision);
        }

        /**
         * Creates a new immutable unitless quantity.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         */        
        public static Unitless<TUnit extends IUnit>(amount: number): IQuantity<IUnit>
        /**
         * Creates a new immutable unitless quantity.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */
        public static Unitless<TUnit extends IUnit>(amount: number, precision: number): IQuantity<IUnit>
        /**
         * Creates a new immutable unitless quantity.
         * @param amount The amount in full precision which should be between 0 and 1 for 0% - 100%.
         * @param precision The precision to use for display purposes, e.g. null, 0, 1, 10, 100, 1000, ....
         */        
        public static Unitless<TUnit extends IUnit>(amount: number, precision?: number): IQuantity<IUnit>
        {
            return new NumberSystem.UnitlessQuantity(amount, precision);
        }        
    }

    namespace NumberSystem
    {
        @Accelatrix_Base.ImmutableObject
        export class GenericQuantity<TUnit extends IUnit> extends Quantity<IUnit>
        {
           public constructor(amount: number, unit: TUnit | string, precision?: number | undefined | null)
           {
               super(amount, unit, precision);
           }
        };

        @Accelatrix_Base.ImmutableObject
        export class UnitlessQuantity extends Quantity<IUnit>
        {
           public constructor(amount: number, precision?: number)
           {
               super(amount, new Unitless(), precision);
           }
        };        

        @Accelatrix_Base.ImmutableObject
        export class Percentage<TUnit extends IUnit> extends Quantity<IUnit>
        {
           public constructor(amount: number, precision?: number)
           {
               super(amount, "%", precision);

               Object.defineProperty(this, "ToString",
                { 
                    value: (formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo) => Accelatrix_Globalization.Globalization.FormatNumber(this.Amount, this.Precision, null, formatting) + "%",
                    enumerable: false
                });                
           }
        };
        
        @Accelatrix_Base.ImmutableObject
        export class Unit implements IUnit
        {
            /**
             * Creates a new Unit instance-
             * @param code The code of the unit, e.g. €.
             */
            public constructor(code: string)
            /**
             * Creates a new Unit instance-
             * @param code The code of the unit, e.g. €.
             * @param shortName The short name of the unit, e.g. "EUR".
             */
            public constructor(code: string, shortName: string)
            /**
             * Creates a new Unit instance-
             * @param code The code of the unit, e.g. €.
             * @param shortName The short name of the unit, e.g. "EUR".
             * @param name The name of the unit "European Union Euro".
             */
            public constructor(code: string, shortName: string, name: string)
            /**
             * Creates a new Unit instance-
             * @param code The code of the unit, e.g. €.
             * @param shortName The short name of the unit, e.g. "EUR".
             * @param name The name of the unit "European Union Euro".
             */
            public constructor(code: string, shortName?: string, name?: string)
            {
                if (String.IsNullOrWhiteSpace(code)) throw new Accelatrix_Base.ArgumentNullException("code");

                Object.defineProperty(this, "Name", { get: () => name, enumerable: true });
                Object.defineProperty(this, "ShortName", { get: () => shortName, enumerable: true });
                Object.defineProperty(this, "Code", { get: () => code, enumerable: true });
    
                Object.defineProperty(this, "ToString",
                { 
                    value: () => this.Code != null && this.Code.trim().length > 0
                                 ? this.Code
                                  : this.ShortName != null && this.ShortName.trim().length > 0
                                     ? this.ShortName
                                     : this.Name == null
                                        ? ""
                                        : this.Name,
                    enumerable: false,
                });                    
            }

            public get Name(): string
            {
                return null as any;
            }

            public get Code(): string
            {
                return null as any;
            }

            public get ShortName(): string
            {
                return null  as any;
            }
        }

        @Accelatrix_Base.ImmutableObject
        export class Unitless implements IUnit
        {
            public constructor()
            {
                Object.defineProperty(this, "ToString", { value: () => "", enumerable: false });
                Object.defineProperty(this, "Code", { get: () => "", enumerable: true });
            }

            public get Name(): string
            {
                return "";
            }

            public get Code(): string
            {
                return "";
            }

            public get ShortName(): string
            {
                return "";
            }
        }  
        
        //******** Defend against package managers that rename symbols */
        Object.defineProperty(Quantity.prototype.constructor, "name", { get: () => "Quantity" });
        Object.defineProperty(GenericQuantity.prototype.constructor, "name", { get: () => "GenericQuantity" });
        Object.defineProperty(UnitlessQuantity.prototype.constructor, "name", { get: () => "UnitlessQuantity" });
        Object.defineProperty(Percentage.prototype.constructor, "name", { get: () => "Percentage" });
        Object.defineProperty(Unit.prototype.constructor, "name", { get: () => "Unit" });
        Object.defineProperty(Unitless.prototype.constructor, "name", { get: () => "Unitless" });
    }    
}

Object.defineProperty(Number.prototype, "Add",
{
    value: function (operands: number | Accelatrix.IQuantity<Accelatrix.IUnit> | Array<number | Accelatrix.IQuantity<Accelatrix.IUnit>>, allowDifferentUnits?: boolean)
    {
        if (operands == null) return this;

        var typeOfOperands = operands.GetType();

        var arrOperands: Array<number> = typeOfOperands.Name == "Number"
                                         ? [operands as number]
                                         : Accelatrix.Quantity.IsQuantity(operands)
                                           ? [(operands as Accelatrix.IQuantity<Accelatrix.IUnit>).Amount]
                                           : !typeOfOperands.IsArray 
                                             ? []
                                             : (<Array<any>>operands).filter(z => z != null).map(z => z.GetType().Name == "Number" 
                                                                                                      ? (z as number)
                                                                                                      : Accelatrix.Quantity.IsQuantity(z)
                                                                                                        ? (z as Accelatrix.IQuantity<Accelatrix.IUnit>).Amount
                                                                                                        : null)
                                                                                            .filter(z => z != null);       
         arrOperands.push(this as number);
       
         // check fo different units
         if ((allowDifferentUnits == null || !allowDifferentUnits) && typeOfOperands.IsArray)
         {
            let allUnits = (<Array<any>>operands).filter(z => z != null && z["Unit"] != null)
                                                 .map(z => z["Unit"] as Accelatrix.IUnit)
                                                 .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);

            for (var i = 0; i < allUnits.length - 1; i++)
                if (!allUnits[i].Equals(allUnits[i + 1]))
                    return null;                   
         }

         let total = 0;    
         arrOperands.forEach(z => total += z);

         /*         
         let calcPrecision = (entry: number | Accelatrix.IQuantity<Accelatrix.IUnit>) => entry == null
                                                                                         ? null
                                                                                         : entry["Precision"] != null
                                                                                           ? entry["Precision"]
                                                                                           : !(entry instanceof Number)
                                                                                             ? null
                                                                                             : entry.toString().indexOf(".") < 0
                                                                                               ? 0
                                                                                               : Math.pow(10, entry.toString().split(".")[1].length);
       
         let originalPrecision = calcPrecision(this);
       
         let precision = typeOfOperands.IsArray
                         ? [originalPrecision].concat((<Array<any>>operands).map(z => calcPrecision(z))
                                                                            .filter(z => z != null)
                                                                            .sort((a, b) => a > b ? -1 : a < b ? 1 : 0))
                                                                            [0]
                         : [originalPrecision].concat([operands as any ].map(z => calcPrecision(z)))
                                              .sort((a, b) => a > b ? -1 : a < b ? 1 : 0)
                                              [0];
       
         return precision == null || precision == 0
                ? total
                : Math.round(total * precision) / precision; 
        */
        return total;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Number.prototype, "ToString",
{
    value: function (precisionOrFormatting?: number | ILocaleFormatInfo, formatting?: ILocaleFormatInfo)
    {
       let formats = formatting != null
                     ? formatting
                     : precisionOrFormatting == null || precisionOrFormatting.GetType().Name == "Number"
                       ? null
                       : precisionOrFormatting as ILocaleFormatInfo;

        let precision = precisionOrFormatting == null || precisionOrFormatting.GetType().Name != "Number"
                        ? null
                        : precisionOrFormatting as number;

        return Accelatrix["Globalization"].FormatNumber(this as number, precision, null, formats);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Number, "Parse",
{
    value: function (numberString: string, formatting?: ILocaleFormatInfo)
    {
        return Accelatrix["Globalization"].ParseNumber(numberString, formatting);
    },
    enumerable: false,
    configurable: true,
});