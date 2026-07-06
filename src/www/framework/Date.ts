/// <reference path="./Base.ts" />
/// <reference path="./String.ts" />

import  { Accelatrix as Accelatrix_Globalization } from './Globalization';

declare global
{
    export interface Date
    {
        /** Produces a culture-aware long date string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToDateTimeString(): string;
        /**
         * Produces a culture-aware long date string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToDateTimeString(formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware long date string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */        
        ToDateTimeString(formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;

        /** Produces a culture-aware time string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToTimeString(): string;
        /**
         * Produces a culture-aware time string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToTimeString(formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware time string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */        
        ToTimeString(formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;

        /** Produces a culture-aware day & month string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToDayMonthString(): string;
        /**
         * Produces a culture-aware day & month string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToDayMonthString(formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware day & month string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */        
        ToDayMonthString(formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;
        
        /** Produces a culture-aware month & year string according to the default ILocaleFormatInfo in Accelatrix.Globalization.DefaultFormatting.*/
        ToMonthYearString(): string;
        /**
         * Produces a culture-aware month & year string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */
        ToMonthYearString(formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;
        /**
         * Produces a culture-aware month & year string according to a specified ILocaleFormatInfo
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting.
         */        
        ToMonthYearString(formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): string;

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
    export interface DateConstructor extends Date
    {
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
        Parse(date: string, formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): Date;
        /**
         * Parses a culture-sensitive string back into a date object according to a specific ILocaleFormatInfo.
         * @param date The culture-sensitive string to parse.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        Parse(date: string, formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): Date

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
        FromMonthYear(monthYear: string, formatting: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): Date;
        /**
         * Parses a culture-sensitive string with month and year back into a date object according to a specified ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         * @param formatting A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        FromMonthYear(monthYear: string, formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo): Date;

        /** Gets the current moment in time. */
        readonly Now: Date;
    }

    export interface ObjectConstructor extends Object
    {
        /**
         * Unboxes ISO serialized dates into date objects in a recursive manner.
         * @param obj The object for which serialized dates are to be unboxed.
         */
        UnboxDates(obj: object): void;
    }
}

Object.defineProperty(Date.prototype, "ToDateTimeString",
{
    value: function (formatting?: ILocaleFormatInfo)
    {
       return Accelatrix_Globalization.Globalization.FormatDateTime(this as Date, formatting);
    },
    enumerable: false,
    configurable: true,
});


Object.defineProperty(Date.prototype, "ToTimeString",
{
    value: function (formatting?: ILocaleFormatInfo)
    {
       return Accelatrix_Globalization.Globalization.FormatTime(this as Date, formatting);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "ToDayMonthString",
{
    value: function (formatting?: ILocaleFormatInfo)
    {
       return Accelatrix_Globalization.Globalization.FormatDayMonth(this as Date, formatting);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "ToMonthYearString",
{
    value: function (formatting?: ILocaleFormatInfo)
    {
       return Accelatrix_Globalization.Globalization.FormatMonthYear(this as Date, formatting);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "Greater",
{
    value: function (date: Date)
    {
       return this.getTime() > date.getTime();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "GreaterOrEqual",
{
    value: function (date: Date)
    {
       return this.getTime() >= date.getTime();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "LesserOrEqual",
{
    value: function (date: Date)
    {
       return this.getTime() <= date.getTime();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "Lesser",
{
    value: function (date: Date)
    {
       return this.getTime() < date.getTime();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddYears",
{
    value: function (years: number)
    {
        var newDate = new Date(this);
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
        newDate.setFullYear(newDate.getFullYear() + years);

        return newDate.getDate() == this.getDate()
               ? newDate
               : newDate.getDate() > this.getDate() //due to leap year
                    ? newDate.AddDays(-1)
                    : newDate.AddDays(1);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddMonths",
{
    value: function (months: number)
    {
        var newDate = new Date(this);
        var isLastDayOfMonth = this.AddDays(1).getMonth() != this.getMonth();
    
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
    
        if (isLastDayOfMonth)
        {
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + months + 1);
            newDate.AddDays(-1);
        }
        else
        {
            newDate.setMonth(newDate.getMonth() + months);
        }
    
        return newDate.getDate() == this.getDate()
            ? newDate
            : newDate.AddDays(-newDate.getDate()); //overran due to different days in month
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddMonths",
{
    value: function (months: number)
    {
        var newDate = new Date(this);
        var isLastDayOfMonth = this.AddDays(1).getMonth() != this.getMonth();
    
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
    
        if (isLastDayOfMonth)
        {
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + months + 1);
            newDate.AddDays(-1);
        }
        else
        {
            newDate.setMonth(newDate.getMonth() + months);
        }
    
        return newDate.getDate() == this.getDate()
            ? newDate
            : newDate.AddDays(-newDate.getDate()); //overran due to different days in month
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddDays",
{
    value: function (days: number)
    {
        var newDate = new Date(this);
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
        return new Date(newDate.setDate(newDate.getDate() + days));
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddHours",
{
    value: function (hours: number)
    {
        var newDate = new Date(this);
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
        return new Date(newDate.setHours(newDate.getHours() + hours));
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddMinutes",
{
    value: function (minutes: number)
    {
        var newDate = new Date(this);
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
        return new Date(newDate.setMinutes(newDate.getMinutes() + minutes));
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddSeconds",
{
    value: function (seconds: number)
    {
        var newDate = new Date(this);
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
        return new Date(newDate.setSeconds(newDate.getSeconds() + seconds));
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date.prototype, "AddMilliseconds",
{
    value: function (milliseconds: number)
    {
        var newDate = new Date(this);
        newDate.setMilliseconds(this.getMilliseconds()); //as this information is lost in the constructor
        return new Date(newDate.setMilliseconds(newDate.getMilliseconds() + milliseconds));
    },
    enumerable: false,
    configurable: true,
});


Object.defineProperty(Date.prototype, "DiffMonths",
{
    value: function (date: Date)
    {
        let meDate = this.AddMilliseconds(1).getMonth() != this.getMonth()
                     ? this.AddMilliseconds(1)
                     : this;

        let referenceDate = date.AddMilliseconds(1).getMonth() != date.getMonth()
                            ? date.AddMilliseconds(1)
                            : date;

        return (meDate.getFullYear() - referenceDate.getFullYear()) * 12 + (meDate.getMonth() - referenceDate.getMonth()) + 1;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date, "FromMonthYear",
{
    value: function (monthYear: string, formatting?: Accelatrix_Globalization.Globalization.ILocaleFormatInfo)
    {
        return Accelatrix_Globalization.Globalization.ParseMonthYear(monthYear, formatting);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date, "Parse",
{
    value: function (dateString: string, formatting?: ILocaleFormatInfo)
    {
        return Accelatrix_Globalization.Globalization.ParseDate(dateString, formatting);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Date, "Now",
{
    get: function ()
    {
        return new Date();
    },
    enumerable: false,
    configurable: true,
});

Date.prototype.toJSON = function ()
{
    var result = this == null
        ? ""
        : this.getFullYear() + "-" +
        (this.getMonth() < 9
            ? "0" + (this.getMonth() + 1)
            : this.getMonth() + 1)
        + "-" +
        (this.getDate() < 10
            ? "0" + this.getDate()
            : this.getDate()) + "T" +
        (this.getHours() < 10
            ? "0" + this.getHours()
            : this.getHours()) + ":" +
        (this.getMinutes() < 10
            ? "0" + this.getMinutes()
            : this.getMinutes()) + ":" +
        (this.getSeconds() < 10
            ? "0" + this.getSeconds()
            : this.getSeconds()) + "." +
        (this.getMilliseconds() < 100 ? "0" : "") +
        (this.getMilliseconds() < 10 ? "0" : "") + this.getMilliseconds();

    if (!Accelatrix_Globalization.Globalization.TimezoneLess)
    {
        var offset = this.getTimezoneOffset();

        if (offset == 0)
            result += "+00:00";
        else
        {
            if (offset > 0)
                result += "-";
            else
                result += "+";

            offset = Math.abs(offset);
            if (offset >= 600)
                result += Math.floor(offset / 60) + ":";
            else
                if (offset >= 60)
                    result += "0" + Math.floor(offset / 60) + ":";
                else
                    result += "00:";

            offset = offset - (Math.floor(offset / 60) * 60);
            if (offset >= 10)
                result += offset;
            else
                result += "0" + offset;
        }
    }
    return result;
}


namespace Accelatrix
{

    const isoDateRegex = new RegExp(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d[0-5]\d|Z))/);

    function StringToDate(textDate: string)
    {
        if ((textDate.substring(textDate.length - 5, textDate.length - 4) == "+" || textDate.substring(textDate.length - 5, textDate.length - 4) == "-") && textDate.substring(textDate.length - 5).indexOf(":") < 0)
            textDate = textDate.substring(0, textDate.length - 2) + ":" + textDate.substring(textDate.length - 2);

        var myDate: Date;
        if (textDate.indexOf("Z") > 0 || textDate.indexOf("+") > 0 || textDate.substring(10).indexOf("-") > 0 || textDate.indexOf("T") < 0)
            myDate = new Date(textDate); //date with timezone
        else
        {
            var datePart = textDate.substring(0, textDate.indexOf("T")).split("-");
            var timePart = textDate.substring(textDate.indexOf("T") + 1).split(":");
            myDate = new Date(Number(datePart[0]), Number(datePart[1]) - 1, Number(datePart[2]), Number(timePart[0]), Number(timePart[1]), Number(timePart[2]));
        }

        return myDate;
    }

    Object.defineProperty(Object, "UnboxDates",
    { 
        value: function(obj: Object)
        {
            if (obj == null) return obj;
        
            if (obj instanceof String || typeof obj == "string")
            {
                return obj != null && (obj as string).length <= 29 && (obj as string).length >= 20 && (obj as string).indexOf(" ") < 0 && "123456789".indexOf((obj as string).substring(0, 1)) >= 0 && isoDateRegex.test(obj as string)
                       ? StringToDate((obj as string).toString())
                       : obj;
            }
            else if (obj instanceof Array || obj.constructor === Array)
            {
                (<Array<any>>obj).forEach((z, i) =>
                                { 
                                    if (z != null) obj[i] = Object.UnboxDates(z)
                                });
            }
            else if (!(typeof obj === 'object'))
                return obj;
            else
                Object.keys(obj)
                      .map(z => ({ Name: z, Value: obj[z]}))
                      .filter(z => z.Value != null)
                      .forEach(z =>
                      {
                            if (z.Value instanceof Array || z.Value.constructor === Array)
                            {
                                (<Array<any>>z.Value).map((w, i) => ({ Index: i, Item: w }))
                                                    .filter(w => w.Item != null)
                                                    .forEach(w => (z.Value)[w.Index] = Object.UnboxDates(w.Item));
                            }
                            else if (typeof z.Value == 'object')
                                Object.UnboxDates(z.Value);
                            else
                            {
                                if (z.Value != null && z.Value.length <= 29 && z.Value.length >= 23 && z.Value.indexOf(" ") < 0 && isoDateRegex.test(z.Value))
                                    obj[z.Name] = StringToDate(z.Value.toString());
                            }
                      });
        
            return obj;
        },
        enumerable: false
    })
}