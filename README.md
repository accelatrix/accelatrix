*****************************************************************************************************************
                                         Accelatrix v1.3.2  

                                   (TypeScript and ES5-compliant)

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

You can now deal with classes in JavaScript at runtime as you would in C#, e.g.:

```
var myDog = new Bio.Mammal(8);  
var myCat = new Bio.Feline(8, 9);

var timeIsSame = (new Date()).Equals(new Date());                //true           
var areEqual = myDog.Equals(myCat);                              // false           
var myCatType = myCat.GetType();                                 // Bio.Feline           
var myCatBaseType = myCat.GetType().BaseType;                    // Bio.Mammal           
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
now enumerations as well, e.g.:

```
  var myEnumeration = Accelatrix.Collections.Enumerable.Range(0, 10000000)
                                            .Select(z => z % 6
                                                         ? new Bio.Feline(z % 10, 9)
                                                         : new Bio.Mammal(z % 10))
                                            .OfType(Bio.Mammal)
                                            .Where(z => z.NumberOfTits != 1)
                                            .GroupBy(z => z.NumberOfTits)

  var myResult = myEnumeration.Skip(2)
                              .Take(4)
                              .ToList()
                              .OrderBy(z => z.NumberOfTits);
```                              


*****************************************************************************************************************

                               Async Enumerations and Functional Programming

*****************************************************************************************************************

You can now use your favourite LINQ operator functions operating on enumerations where members are calculated
async and are (cancellable) promises e.g.:

```
  var myEnumeration = new Accelatrix.Collections.AsyncEnumerable(Accelatrix.Collections.Enumerable.Range(0, 10000000))
                                                .Select(z => Accelatrix.AsyncChainer.Chain(z, r => r)) // creates promise
                                                .Select(z => z % 6
                                                            ? new Bio.Feline(z % 10, 9)
                                                            : new Bio.Mammal(z % 10))
                                                .OfType(Bio.Mammal)
                                                .Where(z => z.NumberOfTits != 1)
                                                .GroupBy(z => z.NumberOfTits)
                                                .Skip(2)
                                                .Take(4)
                                            
  myEnumeration.ToList().then(z => console.log(z));

```                              


*****************************************************************************************************************

                                Typed JSON deserialization 

*****************************************************************************************************************

In order to control the serialzation process, the type-centric JSON serializer makes several decorators available:

    - @KnownType
    - @DataMember
    - @OnSerializing
    - @OnSerialized    
    - @OnDeserializing
    - @OnDeserialized

allowing for TypeScript properties to be stringified, but not the underlying members.

The deserialization also respects types and deserializes to classes instead of plain object.


```
var x = Accelatrix.Serialization.ToJSON(SerializationTests.GetClassInstance())

// '{"$type":"SerializableClass","NameProp":"Test Sat Jul 13 2024 09:12:03 GMT+0200 (Central European Summer Time)","Time":"2024-07-13T09:12:03.527"}'


var y = Accelatrix.Serialization.FromJSON(x)
console.log(y.GetType())  // SerializableClass

```

Even Enumerations with their functions can be serialised and deserialised:

```
var myEnumerable = Accelatrix.Collections.Enumerable
                             .Range(0, 10)
                             .Select(z => new Bio.Canine(z, 2))
                             .OfType(Bio.Mammal)
                             .Where(z => z.NumberOfTits % 2 == 0);  // enumeration not executed

var serialised = Accelatrix.Serialization.ToJSON(myEnumerable);     // enumeration not executed

var newEnumeration = Accelatrix.Serialization.FromJSON(serialised); // enumeration not executed

console.log(newEnumeration);
console.log(newEnumeration.ToList());  // enumeration executed

```

Try it yourself with these classes:

```
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

```

*****************************************************************************************************************

                           Parallel execution with multithreading

                               a Task system with Web Workers 

*****************************************************************************************************************

Ever wanted to cater for parallel execution in the browser, but find the Web Workers specification too low-level
and cumbersome to be of any use?! 

Do you appreciate the ellegance of C#'s Tasks and would like to have something similar in the browser?
Always type-centric?!


```
// one-time init with the Scripts made available to the Workers (no DOM stuff)
// Accelatrix already includes itself and you do not need to worry about it
Accelatrix.Tasks.Config.Scripts.push( // ....... your scripts here

// Example 1
var myTask = new Accelatrix.Tasks.Task(z => "Hello " + z.toString(), "John Doe");
var cancellablePromise = myTask.Start();

cancellablePromise.Then(result => console.log(result))
                  .Catch(ex => console.error(ex))
                  .Finally(task => console.log(task));

// Example 2
var myData = [ new Bio.Canine.Dog(), new Bio.Canine.Wolf(), new Bio.Feline(8, 9) ]

Accelatrix.Tasks.Task.StartNew(data => data.OfType(Bio.Canine).Distinct().ToList(), myData)
                     .GetAwaiter()
                     .Then(result => console.log(result))
                     .Catch(ex => console.error(ex))
                     .Finally(task => console.log(task));

// Example 3: you can even pass enumerations and have them execute in the Web Worker
var myData = Accelatrix.Collections.Enumerable.Range(0, 100000).Select(z => new Bio.Feline(z % 3 == 0, 9));  // nothing executed

Accelatrix.Tasks.Task.StartNew(data => data.Distinct().ToList(), myData)
                     .GetAwaiter()
                     .Then(result => console.log(result))
                     .Catch(ex => console.error(ex))
                     .Finally(task => console.log(task));


// Example 4: Stress load with 100 parallel requests
Accelatrix.Collections.Enumerable.Range(0, 100)
                     .ForEach(z =>
                     {
                            Accelatrix.Tasks.Task.StartNew(data => data.Distinct().ToList(), myData)
                                                 .GetAwaiter()
                                                 .Finally(task => console.log("Task: " + z.toString()));
                     });


// Example 5: Combine tasks into a single resultset
Accelatrix.Tasks.CombinedTask.StartNew([
                                            new Accelatrix.Tasks.Task((a, b) => Accelatrix.Collections.Enumerable.Range(a, b).ToList(), 0, 20),
                                            new Accelatrix.Tasks.Task(() => Accelatrix.Collections.Enumerable.Range(20, 20).ToList()),
                                            () => Accelatrix.Collections.Enumerable.Range(40, 20).ToList(),
                                        ])
                              .GetAwaiter()
                              .Then(result => console.log(result))
                              .Catch(ex => console.error(ex))
                              .Finally(task => console.log(task));                   


// Example 6: Share state between parallel activies (with a cost!)
// This example will produce a single result from the task that runs first
var shared = Accelatrix.Tasks.StatefulActivity();

Accelatrix.Tasks.CombinedTask.StartNew([
					   new Accelatrix.Tasks.ActivitySet([
										z => z.Take(1),
										shared.PushAndEvaluate(z => 1,
                                                               (accumulated, mine) => accumulated.Where(z => z != null).Any()
                                                                                      ? z => z.Take(0)
                                                                                      : z => z ),
										z => z.ToList()
									  ],
									  [[0, 1, 2, 3, 4, 5]]),
					   new Accelatrix.Tasks.ActivitySet([
										z => z.Take(3),
										shared.PushAndEvaluate(z => 3,
                                                               (accumulated, mine) => accumulated.Where(z => z != null).Any()
                                                                                      ? z => z.Take(0)
                                                                                      : z => z.Take(1) ),
										z => z.ToList()
									  ],
									  [[6, 7, 8, 9,10, 11]])
					])
			       .GetAwaiter()
			       .Then(z => console.log(z))
			       .Catch(ex => console.error(ex))
			       .Finally(t => shared.Dispose())
```


*****************************************************************************************************************

                                     Parallel Enumerations
                                           (Beta)

*****************************************************************************************************************

Parallel execution of enumerations with a .AsParallel() that parallelises execution across different threads 
is possible with the .AsParallel() function, e.g.:

```
Accelatrix.Collections.Enumerable
                      .Range(0, 100)
                      .Select(z => "Item " + z.toString())
                      .Skip(2)
                      .Take(10)
                      .AsParallel() // sends everything to threads
                      .GetAwaiter()
                      .Then(z => console.log(z))
                      .Catch(ex => console.error(ex))
```     

This is a Beta release and .GroupBy() is still not fully supported.