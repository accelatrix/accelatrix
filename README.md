*****************************************************************************************************************
                                         Accelatrix v1.1.0

    A parallel functional programming framework for in-browser processing of enumerations of business entities        

*****************************************************************************************************************

    Free for non-commercial use or commercial use without a user login wall.
    Detailed license at https://github.com/accelatrix/accelatrix/blob/main/LICENSE.md

*****************************************************************************************************************

If you would like to have a typed C#-like runtime in the browser instead of just at designtime with TypeScript,
including type introspection, you reached the right place.

If you are a fan of LINQ for Objects and enumerations, you definitely reached the right place.

Accelatrix is compatible with ES5 and provides a C#-like runtime in the browser, including:

    - GetHashCode()
    - GetType()
    - Equals()
    - ToString()

You can now deal with classes in the browser at runtime as you would in C#, e.g.:

```
var myDog = new Bio.Mamal(8);  
var myCat = new Bio.Feline(8, 9);

var timeIsSame = (new Date()).Equals(new Date());                //true           
var areEqual = myDog.Equals(myCat);                              // false           
var myCatType = myCat.GetType();                                 // Bio.Feline           
var myCatBaseType = myCat.GetType().BaseType;                    // Bio.Mamal           
var isAnimal = myCat.GetType().IsAssignableFrom(Bio.Animal);     // true           
var enums = Bio.TypesOfLocomotion.GetType();                     // Accelatrix.EnumType 
```

**********************************************
// sample classes:

```
export namespace Bio
{           
    export enum TypesOfLocomotion           
    {           
        Crawl,           
        Swim,           
        Walk,           
        Fly,           
    }           

    abstract class LivingBeing
    {
        public isExtinct = false;
    }

    export abstract class Eukaryotes extends LivingBeing
    {
        private locomotion: TypesOfLocomotion = null;

        public get Locomotion(): TypesOfLocomotion
        {
            return this.locomotion;
        }
        public set Locomotion(value: TypesOfLocomotion)
        {
            this.locomotion = value;
        }
    }

    export class Animal extends Eukaryotes
    {
        public isAnimal = true;

        public constructor()
        {
            super();
        }
    }
    
    export class Mammal extends Animal
    {
        private readonly numberOfTits: number;

        public constructor(numberOfTits: number)
        {
            super();
            this.numberOfTits = numberOfTits;
        }

        public get NumberOfTits(): number
        {
            return this.numberOfTits;
        }

        public SayHello(): string
        {
            return "Hello";
        }
    }

    export class Feline extends Mammal
    {
        private readonly numberOfLives: number;

        public constructor(numberOfTits: number, numberOfLives: number)
        {
            super(numberOfTits);
            this.numberOfLives = numberOfLives == null ? 9 : numberOfLives;
            this.Locomotion = TypesOfLocomotion.Walk;
        }

        public get NumberOfLives(): number
        {
            return this.numberOfLives;
        }
    }
}
```

*****************************************************************************************************************

                                Enumerations and Functional Programming

*****************************************************************************************************************

You can now use your favourite LINQ operator functions operating on enumerations, not collections, and arrays are
now enumerations, e.g.:

```
  var myEnumeration = Accelatrix.Enumerable.Range(0, 10000000)                              
                                           .Select(z => i % 2 == 0                              
                                                        ? new Bio.Feline(z % 10, 9)                              
                                                        : new Bio.Mamal(z % 10))                              
                                           .OfType(Bio.Mamal)                              
                                           .Where(z => z.NumberOfTits != 1)                                                                         
                                           .GroupBy(z => z.NumberOfTits)                              

  var myResult = myEnumeration.Skip(2)                                                            
                              .Take(10)                                                            
                              .ToList()                              
                              .OrderBy(z => z.NumberOfTits);
```                              


*****************************************************************************************************************

                                Typed JSON deserialization 

*****************************************************************************************************************

In order to control the serialzation process, the Type-centric JSON serializer makes several decorators available:

    - @KnownType
    - @DataMember
    - @OnSerializing
    - @OnSerialized    
    - @OnDeserializing
    - @OnDeserialized

allowing for TypeScript properties to be stringified, but not the underlying members.

The deserialization also respects types and deserializes to classes instead of plain objects.


---
var x = Accelatrix.Serialization.ToJSON(SerializationTests.GetClassInstance())

// '{"$type":"SerializableClass","NameProp":"Test Sat Jul 13 2024 09:12:03 GMT+0200 (Central European Summer Time)","Time":"2024-07-13T09:12:03.527"}'


var y = Accelatrix.Serialization.FromJSON(x)
console.log(y.GetType())  // SerializableClass


---

Try it yourself with these classes:

---
export module SerializationTests
{
    export function GetClassInstance()
    {
        return new SerializableClass("Test " + (new Date()).toString());
    }

    class BaseSerializableClass
    {
        @Accelatrix.Serialization.DataMember(false)
        private baseTime: Date = new Date();

        /** Field will be serialized and when deserialised the value will be retained. */
        @Accelatrix.Serialization.DataMember()
        public get Time(): Date
        {
            return this.baseTime;
        }
        public set Time(value: Date)
        {
            this.baseTime = value;
        }        
    }

    @Accelatrix.Serialization.KnownType
    class SerializableClass extends BaseSerializableClass
    {
        /** Field will NOT be serialized. */
        @Accelatrix.Serialization.DataMember(false)        
        private name: string;

        public constructor(name: string)
        {
            super();
            this.name = name;
        }

        /** Property will be serialized. */
        @Accelatrix.Serialization.DataMember()
        public get NameProp(): string
        {
            return this.name;
        }
        public set NameProp(value: string)
        {
            this.name = value;
        }

        @Accelatrix.Serialization.OnSerializing()        
        private OnSerializing()
        {
            console.log("About to serialize");
        }

        @Accelatrix.Serialization.OnSerialized()
        private OnSerialized()
        {
            console.log("Serialized complete.");
        }

        @Accelatrix.Serialization.OnDeserializing()
        private OnDeserializing()
        {
            console.log("About to deserialize");
        }

        @Accelatrix.Serialization.OnDeserialized()
        private OnDeserialized()
        {
            console.log("Deserialization complete.");
        }            
    }
}

---


*****************************************************************************************************************

                                Parallel execution with multithreading

*****************************************************************************************************************

Parallel execution with a .AsParallel() that parallelizes execution across different threads will be made
available in the near future, e.g.:

```
  var myResult = myEnumeration.AsParallel()                              
                              .Skip(2)                              
                              .Take(10)                              
                              .ToList();
```                              