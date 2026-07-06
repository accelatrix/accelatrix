/// <reference path="./Base.ts" />
/// <reference path="./String.ts" />

import { Accelatrix as Accelatrix_Base } from "./Base";

declare global
{
    export interface Object
    {
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
export namespace Accelatrix
{  
    /** Deals with localization. */
    export class Globalization
    {
        /** Gets or sets the default formatting applied during .ToString() operations if an ILocaleFormatInfo is not provided. */
        public static get DefaultFormatting(): Globalization.ILocaleFormatInfo
        {
            return GlobalizationSystem.currentFormatting == null
                   ? GlobalizationSystem.GetEnvironmentFormatting()
                   : GlobalizationSystem.currentFormatting;
        }
        public static set DefaultFormatting(value: Globalization.ILocaleFormatInfo)
        {
            if (value == null || value as any == "") return;

            GlobalizationSystem.currentFormatting = value == null
                                                    ? GlobalizationSystem.GetEnvironmentFormatting()
                                                    : value.GetType().Name == "String"
                                                      ? Globalization.LocaleFormatInfo.FromCultureCode(value as any)
                                                      : value;
        }

        /** Gets or sets if dates should be serialised and deserialised with timezone. */
        public static get TimezoneLess(): boolean
        {
            return GlobalizationSystem.timezoneless;
        }
        public static set TimezoneLess(value: boolean)
        {
            GlobalizationSystem.timezoneless = value == true;
        }
    }

    /** Deals with localization. */
    export module Globalization
    {
        /** Represent the formatting parameters for a given locale. */
        export interface ILocaleFormatInfo
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

        /** Number simplification options. */
        export enum NumberFormatSimplification
        {
            /** Specified precision is applied. */
            None,

            /** Number is presented as K, M, B as appropriate. */
            Simplify,

            /** Number is presented as B, KB, MB, GB, TB, PB as appropriate. */
            Bytes
        }

        //#region Date

        /**
         * Formats a Date as String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         */
        export function FormatDate(date: Date): string
        /**
         * Formats a Date as String according to a default ILocaleFormatInfo.
         * @param date The date for format.
         * @param abbreviatedMonth If hhe the month component should be forced to be textual or numeric (null for locale's setting).
         */        
        export function FormatDate(date: Date, abbreviatedMonth: boolean): string
        /**
         * Formats a Date as String according to a specified ILocaleFormatInfo.
         * @param date The date for format.
         * @param abbreviatedMonth If hhe the month component should be forced to be textual or numeric (null for locale's setting).
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date as a localized string.
         */
        export function FormatDate(date: Date, abbreviatedMonth: boolean, formats: ILocaleFormatInfo | undefined | null): string
        /**
         * Formats a Date as String according to a specified ILocaleFormatInfo.
         * @param date The date for format.
         * @param abbreviatedMonth If hhe the month component should be forced to be textual or numeric (null for locale's setting).
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date as a localized string.
         */
        export function FormatDate(date: Date, abbreviatedMonth?: boolean, formats?: ILocaleFormatInfo | undefined | null): string        
        {
            if (date == null || date.getDate == null) return "";
    
            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);

            var day = formats.ShortDatePattern.toLowerCase().indexOf("dd") >= 0
                        ? date.getDate() < 10 ? "0" + date.getDate() : '' + date.getDate()
                        : '' + date.getDate();
    
            var month = formats.ShortDatePattern.toLowerCase().indexOf("mmm") >= 0 || abbreviatedMonth != false
                        ? formats.AbbreviatedMonthNames[date.getMonth()]
                        : formats.ShortDatePattern.toLowerCase().indexOf("mm") >= 0
                            ? date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : '' + (date.getMonth() + 1)
                            : '' + (date.getMonth() + 1);
    
            var year = formats.ShortDatePattern.toLowerCase().indexOf("yyyy") >= 0
                        ? '' + date.getFullYear()
                        : ('' + date.getFullYear()).substring(2);
    
            var result = formats.ShortDatePattern;
    
            if (result.indexOf("yyyy") >= 0)
                result = result.replace("yyyy", year);
            else if (result.indexOf("YYYY") >= 0)
                result = result.replace("YYYY", year);
            else if (result.indexOf("YY") >= 0)
                result = result.replace("YY", year);
            else if (result.indexOf("yy") >= 0)
                result = result.replace("yy", year);
    
            if (result.indexOf("DD") >= 0)
                result = result.replace("DD", day);
            else if (result.indexOf("dd") >= 0)
                result = result.replace("dd", day);
            else if (result.indexOf("d") >= 0)
                result = result.replace("d", day);
            else if (result.indexOf("D") >= 0)
                result = result.replace("D", day);
          
            if (result.indexOf("MMMM") >= 0)
                result = result.replace("MMMM", month);
            else if (result.indexOf("mmmm") >= 0)
                    result = result.replace("mmmm", month);           
            else if (result.indexOf("MMM") >= 0)
                result = result.replace("MMM", month);
            else if (result.indexOf("mmm") >= 0)
                    result = result.replace("mmm", month);
            else if (result.indexOf("MM") >= 0)
                    result = result.replace("MM", month);
            else if (result.indexOf("mm") >= 0)
                    result = result.replace("mm", month);
            else if (result.indexOf("M") >= 0)
                result = result.replace("M", month);
            else if (result.indexOf("m") >= 0)
                result = result.replace("m", month);
         
            return result;
        }

        /**
         * Formats a Date as a string containing the day and the name of the month according to the default ILocaleFormatInfo. 
         * @param date The date to format.
         * @returns Returns the formatted date.
         */
        export function FormatDayMonth(date: Date): string
        /**
         * Formats a Date as a string containing the day and the name of the month according to the specified ILocaleFormatInfo.
         * @param date The date to format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the formatted date.
         */
        export function FormatDayMonth(date: Date, formats: ILocaleFormatInfo | undefined | null): string
        /**
         * Formats a Date as a string containing the day and the name of the month according to the specified ILocaleFormatInfo.
         * @param date The date to format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the formatted date.
         */
        export function FormatDayMonth(date: Date, formats?: ILocaleFormatInfo | undefined | null): string        
        {
            if (date == null) return "";

            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);
   
            var day = "" + date.getDate();
            var abbvMonth = formats.AbbreviatedMonthNames[date.getMonth()];
    
            return day + " " + abbvMonth;
        }

        /**
         * Formats a Date as a string containing the name of the month and the year according to the default ILocaleFormatInfo. 
         * @param date The date to format.
         * @returns Returns the formatted date.
         */
        export function FormatMonthYear(date: Date): string
        /**
         * Formats a Date as a string containing the name of the month and the year according to the specified ILocaleFormatInfo.
         * @param date The date to format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the formatted date.
         */
        export function FormatMonthYear(date: Date, formats: ILocaleFormatInfo | undefined | null): string
        /**
         * Formats a Date as a string containing the name of the month and the year according to the specified ILocaleFormatInfo.
         * @param date The date to format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting.
         * @returns Returns the formatted date.
         */
        export function FormatMonthYear(date: Date, formats?: ILocaleFormatInfo | undefined | null): string        
        {
            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);
    
            var month = formats.AbbreviatedMonthNames[date.getMonth()];
    
            var year = formats.ShortDatePattern.toLowerCase().indexOf("yyyy") >= 0
                        ? '' + date.getFullYear()
                        : ('' + date.getFullYear()).substring(2);
    
            return month + " " + year;
        }

        /**
         * Formats a Date with time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         */        
        export function FormatDateTime(date: Date): string
        /**
         * Formats a Date with time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         * @param formats It a different set of formats should be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date as a localized time string.
         */        
        export function FormatDateTime(date: Date, formats: ILocaleFormatInfo | undefined | null): string        
        /**
         * Formats a Date with time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date as a localized time string.
         */        
        export function FormatDateTime(date: Date, formats?: ILocaleFormatInfo | undefined | null): string
        {            
            return date == null
                   ? ""
                   : FormatDate(date, null, formats) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }

        /**
         * Formats a Date as time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         */         
        export function FormatTime(date: Date): string
        /**
         * Formats a Date as time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         * @param formats It a different set of formats should be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date as a localized time string.
         */             
        export function FormatTime(date: Date, formats: ILocaleFormatInfo | undefined | null): string
        /**
         * Formats a Date as time String according to the default ILocaleFormatInfo.
         * @param date The date for format.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date as a localized time string.
         */             
        export function FormatTime(date: Date, formats?: ILocaleFormatInfo | undefined | null): string
        {
            if (date == null) return "";

            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);

            var hours = formats.ShortTimePattern.toLowerCase().indexOf(" a") > 0 || formats.ShortTimePattern.toLowerCase().indexOf(" tt") > 0
                        ? date.getHours() <= 12
                            ? date.getHours() + ""
                            : (date.getHours() - 12) + ""
                        : date.getHours() + "";
    
            hours = hours.length > 1 || formats.ShortTimePattern.toLowerCase().indexOf("hh:") < 0
                    ? hours
                    : "0" + hours;
    
            var minutes = formats.ShortTimePattern.toLowerCase().indexOf(":mm") >= 0
                          ? date.getMinutes() <= 9 ? "0" + date.getMinutes() : "" + date.getMinutes()
                          : "" + date.getMinutes();
    
            var hourFormat = formats.ShortTimePattern.toLowerCase().indexOf(" a") > 0 || formats.ShortTimePattern.toLowerCase().indexOf(" tt") > 0
                             ? date.getHours() < 12 ? " am" : " pm"
                             : "";
    
            return hours + ":" + minutes + hourFormat;
        }        

        /**
         * Parses a month year string back into a date according to the default ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         */
        export function ParseMonthYear(monthYear: string): Date
        /**
         * Parses a month year string back into a date according to the specified ILocaleFormatInfo.
         * @param monthYear The month year to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        export function ParseMonthYear(monthYear: string, formats: ILocaleFormatInfo | undefined | null): Date
        /**
         *  Parses a month year string back into a date according to the specified ILocaleFormatInfo.
         * @param monthYear he month year to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date parsed from the month year supplied.
         */
        export function ParseMonthYear(monthYear: string, formats?: ILocaleFormatInfo | undefined | null): Date
        {
            if (monthYear == null || monthYear.length == 0 || monthYear.indexOf(" ") < 0) return null;

            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);
    
            var monthName = monthYear.substring(0, monthYear.indexOf(" ")).toLocaleLowerCase();
            var monthNumber : number = 0;
    
            for (var i = 0; i < formats.AbbreviatedMonthNames.length; i++)
                if (formats.AbbreviatedMonthNames[i].toLocaleLowerCase() == monthName)
                {
                    monthNumber = i;
                    break;
                }
    
            var year = Number(monthYear.substring(monthYear.indexOf(" ") + 1));
    
            return new Date(year, monthNumber, 1);
        }

        /**
         * Parses a date string back into a date according to the default ILocaleFormatInfo.
         * @param date The date string to parse.
         */        
        export function ParseDate(date: string): Date
        /**
         * Parses a date string back into a date according to the specified ILocaleFormatInfo.
         * @param date The date string to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */        
        export function ParseDate(date: string, formats: ILocaleFormatInfo | undefined | null): Date
        /**
         *  Parses a date string back into a date according to the specified ILocaleFormatInfo.
         * @param date The date string to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the date parsed from the string supplied.
         */        
        export function ParseDate(date: string, formats?: ILocaleFormatInfo | undefined | null): Date
        {
            if (String.IsNullOrWhiteSpace(date)) return new Date();
    
            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);

            var temp = formats.ShortDatePattern.toLowerCase();
    
            var dayPosition = (temp.indexOf("d") < temp.indexOf("m")) && (temp.indexOf("d") < temp.indexOf("y"))
                                ? 0
                                : (temp.indexOf("d") > temp.indexOf("m")) && (temp.indexOf("d") > temp.indexOf("y"))
                                    ? 2
                                    : 1;
    
            var monthPosition = (temp.indexOf("m") < temp.indexOf("d")) && (temp.indexOf("m") < temp.indexOf("y"))
                                ? 0
                                : (temp.indexOf("m") > temp.indexOf("d")) && (temp.indexOf("m") > temp.indexOf("y"))
                                    ? 2
                                    : 1;
    
            var yearPosition = (temp.indexOf("y") < temp.indexOf("d")) && (temp.indexOf("y") < temp.indexOf("m"))
                                ? 0
                                : (temp.indexOf("y") > temp.indexOf("d")) && (temp.indexOf("y") > temp.indexOf("m"))
                                    ? 2
                                    : 1;
    
            var dateSeparators = formats.ShortDatePattern.split(/(?:d|D|m|M|y|Y)+/)
                                                         .map(z => z.indexOf("\,") >= 0 || z.indexOf("\-") >= 0 || z.indexOf("\\") >= 0 || z.indexOf("\/") >= 0 ? z.trim() : z)
                                                         .filter(z => z.length > 0);
    
            var tentativeParts = date.split(new RegExp("(?:" + dateSeparators.map(z => "\\" + z).filter(z => z.length > 0).join("|") + ")+", "g"))
                                      .filter(z => z != null && z.trim().length > 0);
    
            //day
            var day = dayPosition > (tentativeParts.length - 1) || tentativeParts[dayPosition].length == 0 || !(/^\d+$/.test(tentativeParts[dayPosition])) || parseInt(tentativeParts[dayPosition]) < 1
                        ? 1
                        : parseInt(tentativeParts[dayPosition]) > 31
                            ? 31
                            : parseInt(tentativeParts[dayPosition]);
    
            //month
            var month = monthPosition > (tentativeParts.length - 1) || tentativeParts[monthPosition].length == 0
                        ? new Date().getMonth() + 1
                        : /^\d+$/.test(tentativeParts[monthPosition])
                           ? parseInt(tentativeParts[monthPosition]) > 12
                              ? 12
                              : parseInt(tentativeParts[monthPosition]) < 1
                                ? 1
                                : parseInt(tentativeParts[monthPosition])
                           : Latinise(formats.AbbreviatedMonthNames.toString()).toLowerCase().replace(/\./g,"").split(",").indexOf(Latinise(tentativeParts[monthPosition].toLowerCase().replace(/\./g,""))) + 1;
    
            // partial match month names when there is a separator that may be contained in the month's name
            var separatorsContainedInMonthName = dateSeparators.map(z => z.trim()).filter(z => formats.AbbreviatedMonthNames.filter(w => w.indexOf(z) >= 0).length > 0);
            if (month == 0 && separatorsContainedInMonthName.length > 0 && tentativeParts[monthPosition] != null && tentativeParts[monthPosition].length > 0)
            {
                let monthNames = Latinise(formats.AbbreviatedMonthNames.toString()).toLowerCase().replace(/\./g,"").split(",");
                let tentativeMonthName = Latinise(tentativeParts[monthPosition].toLowerCase().replace(/\./g,""));
                month = monthNames.map((z, i) => ({ Index: i + 1, Name: z }))
                                  .filter(z => separatorsContainedInMonthName.filter(w => tentativeMonthName + w == z.Name
                                                                                            || w + tentativeMonthName == z.Name
                                                                                            || (tentativeMonthName.indexOf(w) == 0 && tentativeMonthName.substring(w.length) == z.Name)
                                                                                            || (tentativeMonthName.length > w.length && tentativeMonthName.substring(0, tentativeMonthName.length - w.length) == z.Name))
                                                                             .length > 0)
                                  .map(z => z.Index)
                                  .concat([parseInt(tentativeMonthName.replace(/\D/g,''))])
                                  .concat([1])
                                  .filter(z => z != null && !isNaN(z))
                                  [0];
            }
            else if (month == 0 && tentativeParts[monthPosition] != null && tentativeParts[monthPosition].trim().length > 0)
            {
               var partialMatches = formats.AbbreviatedMonthNames.filter(z => Latinise(z.toLowerCase()).indexOf(Latinise(tentativeParts[monthPosition].toLowerCase())) >= 0);
               
               if (partialMatches.length >= 1)
                  month = formats.AbbreviatedMonthNames.map((z, i) => ({Index: i, Item: z}))
                                                       .filter(z => z.Item == partialMatches[0])
                                                       .map(z => z.Index + 1)[0];
            }
    
            month = month <= 0 ? 1 : month;  
    
            //year
            var year = yearPosition > (tentativeParts.length - 1) || tentativeParts[yearPosition].length == 0 || !(/^\d+$/.test(tentativeParts[yearPosition])) || parseInt(tentativeParts[yearPosition]) < 1
                        ? new Date().getFullYear()
                        : parseInt(tentativeParts[yearPosition]) > 2100
                            ? 2100
                            : tentativeParts[yearPosition] != null && tentativeParts[yearPosition].length <= 2 && formats.ShortDatePattern.toLowerCase().indexOf("yyyy") < 0
                                ? parseInt(new Date().getFullYear().toString().substring(0, 2) + tentativeParts[yearPosition])
                                : parseInt(tentativeParts[yearPosition]);
    
            return new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
        }
        
        /**
         * Replaces accented letters with their accent-free equivalent. Usefull for sorting and other string-based comparison functions.
         * @param text The text to latinise.
         * @returns Returns the accent-free version of the text.
         */
        function Latinise(text: string): string
        {
            return String.IsNullOrWhiteSpace(text)
                   ? text
                   : text.Latinise();
        }

        //#endregion
    
        //#region Boolean

        /**
         * Formats a boolean as string.
         * @param value The value to format.
         * @returns Returns the string represenation of the boolean.
         */
        export function FormatBoolean(value?: Boolean): string
        {
            return value == null
                    ? ""
                    : value.toString().toLowerCase();                
        }

        //#endregion

        //#region Number

        /**
         * Formats a number as string according to the default ILocaleFormatInfo.
         * @param number The number to format.
         */
        export function FormatNumber(number: number): string
        /**
         * 
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         */
        export function FormatNumber(number: number, precision: number): string
        /**
         * Formats a number as string according to the default ILocaleFormatInfo.
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param numberFormatSimplification If the number should be simplified, e.g. 1.1K, 2.2M.
         */
        export function FormatNumber(number: number, precision: number, numberFormatSimplification: NumberFormatSimplification): string
        /**
         * Formats a number as string according to the specific ILocaleFormatInfo.
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param numberFormatSimplification If the number should be simplified, e.g. 1.1K, 2.2M.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        export function FormatNumber(number: number, precision: number, numberFormatSimplification: NumberFormatSimplification | undefined | null, formats: ILocaleFormatInfo | undefined | null): string
        /**
         * Formats a number as string according to the specific ILocaleFormatInfo.
         * @param number The number to format.
         * @param precision The precision, null or 0 for full precision, 1 for integer, 10 for 1 decinal, 100 for 2 decimals, etc.
         * @param numberFormatSimplification If the number should be simplified, e.g. 1.1K, 2.2M.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         * @returns Returns the specified number as a formatted string.
         */
        export function FormatNumber(number: number, precision?: number, numberFormatSimplification?: NumberFormatSimplification | undefined | null, formats?: ILocaleFormatInfo | undefined | null): string
        {
            if (number == null) return "";
            
            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);

            if (precision == 0) precision = null; //to avoid 0.0            
            
            var sep = formats.NumberGroupSeparator == null || formats.NumberGroupSeparator.length == 0 ? " " : formats.NumberGroupSeparator;
            var dec = formats.NumberDecimalSeparator == null || formats.NumberDecimalSeparator.length == 0 ? '.' : formats.NumberDecimalSeparator;
            var kilo = formats.ThousandsSign == null || formats.ThousandsSign.length == 0 ? 'K' : formats.ThousandsSign;
            var mega = formats.MillionsSign == null || formats.MillionsSign.length == 0 ? 'M' : formats.MillionsSign;
            var giga = formats.BillionsSign == null || formats.BillionsSign.length == 0 ? 'B' : formats.BillionsSign;
    
            var fixedNumber = number.GetType() != Accelatrix["Type"].Number
                              ? ParseNumber(("" + number))
                              : number;
    
            let simplificationBase = numberFormatSimplification == null
                                     ? 1
                                     : numberFormatSimplification == NumberFormatSimplification.Simplify || numberFormatSimplification.toString() == "Simplify"
                                       ? 1000
                                       : 1024;
    
            let simplificationSuffix = numberFormatSimplification == null || numberFormatSimplification == NumberFormatSimplification.None || numberFormatSimplification.toString() == "None"
                                        ? ""
                                        : Math.abs(fixedNumber) < simplificationBase
                                            ? ""
                                            : (Math.round(10 * Math.abs(fixedNumber) / (simplificationBase * simplificationBase)) / 10) < 1
                                                ? kilo
                                                : (Math.round(10 * Math.abs(fixedNumber) / (simplificationBase * simplificationBase * simplificationBase)) / 10) < 1
                                                    ? mega
                                                    : giga;
    
            precision = precision == null && simplificationSuffix == ""
                        ? 0
                        : simplificationSuffix == ""
                            ? Math.abs(precision) >= 1 ? Math.abs(precision) : Math.pow(10, (Math.abs(precision)).toString().length - 2)
                            : simplificationSuffix == kilo
                                ? 0
                                : 10;
    
            fixedNumber = simplificationSuffix == ""
                            ? fixedNumber
                            : simplificationSuffix == kilo
                                ? Math.round(fixedNumber / simplificationBase)
                                : simplificationSuffix == mega
                                    ? fixedNumber / (simplificationBase * simplificationBase)
                                    : fixedNumber / (simplificationBase * simplificationBase * simplificationBase);
    
            //if (simplificationSuffix == kilo) simplificationSuffix = "";
    
            var parts = precision != undefined && precision > 0
                        ? ((Math.round(fixedNumber * precision) / precision).toString() + ".").split(".")
                        : (fixedNumber.toString() + ".").split(".");
    
            var result = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (parts[1] ? dec + parts[1] : "");
    
            var decimals = precision == undefined || precision <= 0
                            ? 0
                            : precision >= 1
                                ? ("" + precision).length - 1
                                : ("" + precision).split(".")[1].length - 1;
    
            if (decimals != undefined && decimals > 0)
            {
                var existingDecimals = result.indexOf(dec) >= 0
                                       ? result.split(dec)[1].length
                                       : 0;
    
                if (existingDecimals == 0) result += dec;
    
                for (var i: number = existingDecimals; i < decimals; i++)
                    result += "0";
            }
    
            if (numberFormatSimplification == NumberFormatSimplification.Bytes && simplificationSuffix == "" && result.indexOf(formats.NumberDecimalSeparator + "0", result.length - (formats.NumberDecimalSeparator + "0").length) !== -1)
                result = result.split(formats.NumberDecimalSeparator)[0];
    
            return numberFormatSimplification == NumberFormatSimplification.Bytes
                    ? result + " " + simplificationSuffix + "B"
                    : result + simplificationSuffix;
        }
            
        /**
         * Parses a number string back into a number according to the default ILocaleFormatInfo.
         * @param number The number to parse.
         */
        export function ParseNumber(number: string): number
        /**
         * Parses a number string back into a number according to the specific ILocaleFormatInfo.
         * @param number The number to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        export function ParseNumber(number: string, formats: ILocaleFormatInfo | undefined | null): number
        /**
         * Parses a number string back into a number according to the specific ILocaleFormatInfo.
         * @param number The number to parse.
         * @param formats A different set of formats to be used instead of Globalization.DefaultFormatting. 
         */
        export function ParseNumber(number: string, formats?: ILocaleFormatInfo | undefined | null): number
        {        
            if (formats == null)
                formats = Globalization.DefaultFormatting;
            else if (formats.GetType().Name == "String")
                formats = LocaleFormatInfo.FromCultureCode(formats as any);

            var sep = formats.NumberGroupSeparator == null || formats.NumberGroupSeparator.length == 0 ? " " : formats.NumberGroupSeparator;
            var dec = formats.NumberDecimalSeparator == null || formats.NumberDecimalSeparator.length == 0 ? '.' : formats.NumberDecimalSeparator;
    
            var fixedNumber = Number(number.replace(new RegExp("/" + sep + "/g"), "").replace(new RegExp("/" + dec + "/g"), "."));
    
            if (isNaN(fixedNumber))
            {
                //agressive replacement
                var temp = "";
                var theNumber = (number + "").replace(new RegExp("/" + sep + "/g"), "").replace(new RegExp("/" + dec + "/g"), ".");
                for (var i = 0; i < theNumber.length; i++) {
                    if (theNumber[i] == "1" || theNumber[i] == "2" || theNumber[i] == "3" || theNumber[i] == "4" || theNumber[i] == "5" || theNumber[i] == "6" || theNumber[i] == "7" || theNumber[i] == "8" || theNumber[i] == "9" || theNumber[i] == "0" || theNumber[i] == ".")
                        temp += theNumber[i];
                }
    
                if (theNumber.substring(0, 1) == "-") temp = "-" + temp;
    
                fixedNumber = Number(temp);
            }
    
            return fixedNumber;
        }

        //#endregion        
    
        
        /** The number and date formats associated with a given locale. */
        export class LocaleFormatInfo implements Globalization.ILocaleFormatInfo 
        {
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
            public constructor(shortDatePattern: string, shortTimePattern : string, numberDecimalSeparator: string, numberGroupSeparator: string, abbreviatedMonthNames: string[], thousandsSign: string, millionsSign: string, billionsSign: string)
            {
                if (String.IsNullOrWhiteSpace(shortDatePattern)) throw new Accelatrix_Base.ArgumentNullException("shortDatePattern");
                if (String.IsNullOrWhiteSpace(shortTimePattern)) throw new Accelatrix_Base.ArgumentNullException("shortTimePattern");
                if (String.IsNullOrWhiteSpace(numberDecimalSeparator)) throw new Accelatrix_Base.ArgumentNullException("numberDecimalSeparator");
                if (numberGroupSeparator == null || numberGroupSeparator.length == 0) throw new Accelatrix_Base.ArgumentNullException("numberGroupSeparator");
                if (abbreviatedMonthNames == null || abbreviatedMonthNames.length == 0) throw new Accelatrix_Base.ArgumentNullException("abbreviatedMonthNames");
                if (abbreviatedMonthNames.length < 12) throw new Accelatrix_Base.ArgumentException("'abbreviatedMonthNames' cannot contain less that 12 entries.");
                if (String.IsNullOrWhiteSpace(thousandsSign)) throw new Accelatrix_Base.ArgumentNullException("thousandsSign");
                if (String.IsNullOrWhiteSpace(millionsSign)) throw new Accelatrix_Base.ArgumentNullException("millionsSign");
                if (String.IsNullOrWhiteSpace(billionsSign)) throw new Accelatrix_Base.ArgumentNullException("billionsSign");
    
                Object.defineProperty(this, "ShortDatePattern", { get: () => shortDatePattern, enumerable: true });
                Object.defineProperty(this, "ShortTimePattern", { get: () => shortTimePattern, enumerable: true });
                Object.defineProperty(this, "NumberDecimalSeparator", { get: () => numberDecimalSeparator, enumerable: true });
                Object.defineProperty(this, "NumberGroupSeparator", { get: () => numberGroupSeparator, enumerable: true });
                Object.defineProperty(this, "AbbreviatedMonthNames", { get: () => abbreviatedMonthNames, enumerable: true });
                Object.defineProperty(this, "ThousandsSign", { get: () => thousandsSign, enumerable: true });
                Object.defineProperty(this, "MillionsSign", { get: () => millionsSign, enumerable: true });
                Object.defineProperty(this, "BillionsSign", { get: () => billionsSign, enumerable: true });

                try
                {
                    Object.defineProperty(this, "ToString", { value: () => "[LocaleFormatInfo]", enumerable: false });
                }
                catch(ex)
                {

                }

                Accelatrix_Base.ImmutableObject.Freeze(this);
            }
    
            /** Gets the short date pattern, e.g. dd/mm/yyyy. */
            public get ShortDatePattern() : string
            {
                return null;
            }
    
            /** Gets the short time pattern, e.g. hh:. */
            public get ShortTimePattern() : string
            {
                return null;
            }
    
            /** Gets the decimal separator for numbers. */        
            public get NumberDecimalSeparator() : string
            {
                return null;
            }
            
            /** Gets the thousands separator for numbers. */
            public get NumberGroupSeparator() : string
            {
                return null;
            }
            
            /** Gets the abbreviated form of the name of the months. */
            public get AbbreviatedMonthNames() : string[]
            {
                return null;
            }
            
            /** Gets the abbreviated form for thousands, e.g. K. */
            public get ThousandsSign() : string
            {
                return null;
            }
            
            /** Gets the abbreviated form for thousands, e.g. M. */
            public get BillionsSign() : string
            {
                return null;
            }
    
            /** Gets the abbreviated form for thousands, e.g. B. */
            public get MillionsSign() : string
            {
                return "";
            }
    
            /**
             * Gets the formats associated with a culture code.
             * @param cultureCode The ISo culture code, e.g. en-US, en-GB, pt-PT;
             * @returns Returns the formats associated with the specifi«ed culture code.
             */
            public static FromCultureCode(cultureCode: string): LocaleFormatInfo
            {
                return GlobalizationSystem.GetFormattingForCultureCode(cultureCode);
            }
    
            /**
             * Gets the formats associated with the current browser environment.
             * @returns Returns the formats associated with the current browser environment.
             */
            public static FromEnvironment(): LocaleFormatInfo
            {
                return GlobalizationSystem.GetEnvironmentFormatting();
            }        
        }        
    }

    namespace GlobalizationSystem
    {        
        var environmentFormatting: Globalization.ILocaleFormatInfo;
        export var currentFormatting: Globalization.ILocaleFormatInfo;        

        export var timezoneless = true;

        export function GetEnvironmentFormatting():Globalization.ILocaleFormatInfo
        {
            if (environmentFormatting != null)
                return environmentFormatting;
            try
            {
                environmentFormatting = GetFormattingForCultureCode();
            }
            catch(e)
            {
                environmentFormatting = new Globalization.LocaleFormatInfo("dd/mm/yyyy", "hh:mm", ".", "'", ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dec"], "K", "M", "B");
            }
            finally
            {
                return environmentFormatting;
            }
        }

        export function GetFormattingForCultureCode(cultureCode?: string): Globalization.ILocaleFormatInfo
        { 
            if (String.IsNullOrWhiteSpace(cultureCode))
                cultureCode = undefined;
            else if (cultureCode == null && !(cultureCode === undefined))
                cultureCode = undefined;

            let sampleDate = new Date(2000,3,3).toLocaleDateString(cultureCode, { day: 'numeric', month: 'numeric', year: 'numeric'});
            let parts = sampleDate.split(/[^\d]/);
            let separator = sampleDate.substring(parts[0].length, parts[0].length + 1);
    
            let getSymbol = value => Number(value) > 31 // some countries have different years
                                     ? "yyyy"
                                     : value.indexOf("4") >= 0
                                        ? value.length == 2 ? "mm" : "m"
                                        : value.indexOf("3") >= 0
                                            ? value.length == 2 ? "dd" : "d"
                                            : "yyyy";
        
            let shortDatePattern = getSymbol(parts[0]) + separator + getSymbol(parts[1]) + separator + getSymbol(parts[2]);
    
            let abbreviatedMonthNames: string[] = [];
            for (var i = 0; i < 12; i++)
                abbreviatedMonthNames[i] = new Date(2000, i, 1).toLocaleString(cultureCode === undefined ? 'default' : cultureCode, { month: 'short' });
    
            // determine if month is numeric or name by asking for the short name for the culture and compare the result
            let sampleDate2 = new Date(2000,2,3).toLocaleDateString(cultureCode, { day: 'numeric', month: 'short', year: 'numeric'});
            sampleDate.split("").forEach(z => sampleDate2 = sampleDate2.replace(z, ""));

            if (sampleDate2.trim().length > 0)
                shortDatePattern = shortDatePattern.indexOf("mm") >= 0
                                   ? shortDatePattern.replace("mm", "MMM")
                                   : shortDatePattern.replace("m", "MMM");

            let decimalSeparator = (1.2).toLocaleString(cultureCode).replace("1", "").replace("2", "");
            let thousandsSeparator = (10000).toLocaleString(cultureCode).replace("1", "").replace(/0/g, "");

            let timePattern = new Date(2000,3,3, 20, 4, 5).toLocaleTimeString(cultureCode);
            
            timePattern = timePattern.indexOf("20") >= 0
                            ? timePattern.replace("20", "hh")
                            : timePattern.replace("8", "h");

            timePattern = timePattern.indexOf("04") >= 0
                            ? timePattern.replace("04", "mm")
                            : timePattern.replace("4", "m");

            timePattern = timePattern.indexOf("05") >= 0
                            ? timePattern.replace("05", "ss")
                            : timePattern.replace("5", "s");

            timePattern = timePattern.toLowerCase().indexOf("pm") >= 0
                            ? timePattern.replace(" pm", " a").replace(" PM", " a")
                            : timePattern;

            return new Globalization.LocaleFormatInfo(shortDatePattern, timePattern, decimalSeparator, thousandsSeparator, abbreviatedMonthNames, "K", "M", "B");
        }

        //******** Defend against package managers that rename symbols */
        Object.defineProperty(Globalization.prototype.constructor, "name", { get: () => "Globalization" });
        Object.defineProperty(Globalization.LocaleFormatInfo.prototype.constructor, "name", { get: () => "LocaleFormatInfo" });
    }
}