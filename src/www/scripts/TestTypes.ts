import { Accelatrix } from "www/framework/Base";
import { Accelatrix as AccelatrixSerialization } from "www/framework/Serialization";
import { Person } from "GenPopulation";

self["AccelatrixSerialization"] = Accelatrix;


export function StandaloneFunction()
{
    return "Hello"
}

export namespace Bio
{

    function StandaloneFunction2()
    {
        var x = 1 + 1;
    }

    export function StandaloneFunction3()
    {
        var x = 1 + 1;

        return x;
    }

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
    
    @AccelatrixSerialization.Serialization.KnownType("Bio.Mammal")
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

    export class Canine extends Mammal
    {
        private readonly numberOfTeeth: number;

        public constructor(numberOfTits: number, numberOfTeeth: number)
        {
            super(numberOfTits);

            if (numberOfTeeth == null)
                throw new Accelatrix.ArgumentNullException("numberOfTeeth");

            this.numberOfTeeth = numberOfTeeth;
            this.Locomotion = TypesOfLocomotion.Walk;
        }

        public get NumberOfTeeth(): number
        {
            return this.numberOfTeeth;
        }

        private static Wolf =  class Wolf extends Canine
                               {
                                   constructor()
                                   {
                                        super(8, 42);
                                   }
                               }

        private static Dog =  class Dog extends Canine
                               {
                                   constructor()
                                   {
                                        super(8, 42);
                                   }
                               }
    }
}

export namespace Dental
{
    abstract class Tooth
    {        
        private numberOfRoots = 1;
        protected Tooth()
        {

        }

        public get NumberOfRoots(): number
        {
            return this.numberOfRoots;
        }
        public set NumberOfRoots(value: number)
        {
            this.numberOfRoots = value;
        }
    }

    export class Canine extends Tooth
    {
        constructor()
        {
            super();
            this.NumberOfRoots = 1;
        }
    }

    export class PreMolar extends Tooth
    {
        constructor()
        {
            super();
            this.NumberOfRoots = 2;
        }
    }

    @Accelatrix.ImmutableObject
    export class Molar extends Tooth
    {
        constructor()
        {
            super();
            this.NumberOfRoots = 3;
        }
    }

    export module DentalCare
    {
        export function AnimalATeeth() : Array<Tooth>
        {
            return [
                      new Canine(),
                      new Canine(),
                      new PreMolar(),
                      new PreMolar(),
                      new PreMolar(),
                      new PreMolar(),
                      new Molar(),
                      new Molar(),
                      new Molar(),
                      new Molar(),
                      new Molar(),
                   ]
        }
    }
}


namespace Test_Serialization
{
@AccelatrixSerialization.Serialization.KnownType
export class Parent
{
    public Name: string = "";
    constructor()
    {
        this.Name = "Parent";
    }

    /** Property will be serialised. */
    @AccelatrixSerialization.Serialization.DataMember()
    public get NameProp(): string
    {
        return this.Name;
    }
    public set NameProp(value: string)
    {
        this.Name = value;
    }    
}

@AccelatrixSerialization.Serialization.KnownType
export class Child extends Parent
{
    constructor()
    {
        super();
        this.Name = "Child";
    }
}
}

export module SerializationTests
{
    export function GetClassInstance()
    {
        return new SerializableClass("Test " + (new Date()).toString());
    }

    @AccelatrixSerialization.Serialization.KnownType
    class BaseSerializableClass
    {
        @AccelatrixSerialization.Serialization.DataMember(false)
        private baseTime: Date = new Date();

        @AccelatrixSerialization.Serialization.DataMember()
        public get Time(): Date
        {
            return this.baseTime;
        }
        public set Time(value: Date)
        {
            this.baseTime = value;
        }        
    }

    @AccelatrixSerialization.Serialization.KnownType
    class SerializableClass extends BaseSerializableClass
    {
        /** Field will NOT be serialised. */
        @AccelatrixSerialization.Serialization.DataMember(false)        
        private name: string;

        public constructor(name: string)
        {
            super();
            this.name = name;
        }

        /** Property will be serialised. */
        @AccelatrixSerialization.Serialization.DataMember()
        public get NameProp(): string
        {
            return this.name;
        }
        public set NameProp(value: string)
        {
            this.name = value;
        }

        /** Property will be serialised. */
        @AccelatrixSerialization.Serialization.DataMember("Property2")
        public get NameProp2(): string
        {
            return this.name;
        }
        public set NameProp2(value: string)
        {
            this.name = value;
        }

        @AccelatrixSerialization.Serialization.OnSerializing()        
        private OnSerializing()
        {
            console.log("About to serialize", this);
        }

        @AccelatrixSerialization.Serialization.OnSerialized()
        private OnSerialized()
        {
            console.log("Serialized complete.", this);
        }

        @AccelatrixSerialization.Serialization.OnDeserializing()
        private OnDeserializing()
        {
            console.log("About to deserialize", this);
        }

        @AccelatrixSerialization.Serialization.OnDeserialized()
        private OnDeserialized()
        {
            console.log("Deserialization complete.", this);
        }            
    }
}

/*
export module DataMovement
{
    const worker = SpawnWorker();
    const testData = {};

    export function MessageTest(populationSize: number)
    {
        if (testData[populationSize] == null)
            testData[populationSize] = window["GenPopulation"](populationSize);

        var start = new Date().getTime();
        var serialised = AccelatrixSerialization.Serialization.ToJSON(testData[populationSize]);
        var postSerialised = new Date().getTime();
        var serialisedIn = postSerialised - start;
        console.log("Serialization: " + serialisedIn);
        worker.postMessage(postSerialised.toString() + "," + serialised);
    }

    export function CloneTest(populationSize: number)
    {
        if (testData[populationSize] == null)
            testData[populationSize] = window["GenPopulation"](populationSize);

        var start = new Date().getTime();
        testData[populationSize][0] = start;
        //testData[populationSize][1] = function test() { return 123;};
        worker.postMessage(testData[populationSize]);
    }

    function SpawnWorker()
    {
        var worker: Worker;

        var blob;

        var workerCode = `
        self.onmessage = function(e)
        {
            var now = new Date().getTime();
            
            if (typeof e.data == "string")
            {
                var timestamp = Number(e.data.substring(0, e.data.indexOf(",")));
                console.log("Received: " + (now - timestamp));

                var data = e.data.substring(e.data.indexOf(",") + 1);
                now = new Date().getTime();
                var temp = JSON.parse(data);
                var postDeserialised = new Date().getTime();
                var deserializedIn = postDeserialised - now; 

                console.log("Deserialization: " + deserializedIn);                                    
            }
            else
            {
                var timestamp = Number(e.data[0]);
                console.log("Received: " + (now - timestamp));
            }        
        }
        `;

        try
        {
            blob = new Blob([workerCode], { type: 'application/javascript' });
        }
        catch (e)
        {
            // Backwards-compatibility
            var blobBuilder = self["BlobBuilder"] || self["WebKitBlobBuilder"] || self["MozBlobBuilder"] || self["MSBlobBuilder"];
            blob = new blobBuilder();
            blob.append(workerCode);
            blob = blob.getBlob();
        }

        worker = new Worker(URL.createObjectURL(blob));

        return worker;
    }
}
*/

export module TestCases
{
    var when: Date;
    var framecount = 0;
    var isSampling = false;
   
    function StartFrameCounter()
    {
        isSampling = true;
        when = new Date();
        framecount = 0;
        Sample();
    }
   
    function Sample()
    {
        if (isSampling)
          window.requestAnimationFrame(() =>
          {
            framecount++;
            if (isSampling) Sample();
          });

        /*
        if (isSampling)
        {
            setTimeout(() =>
            {
                framecount++;
                if (isSampling) Sample();
            }, 60)
        } */
    }

    function StopFrameCounter()
    {        
        var now = new Date();
        isSampling = false;        
        const elapsed = now.getTime() - when.getTime();
        const expectedFrames = (elapsed / 1000) * 60;
        const missedFrames = (expectedFrames - framecount);
        console.log("Elapsed: " + elapsed + "ms", 
                    ", Frames dropped (@60Hz): " + Math.round(missedFrames),
                    ", Frame drop rate: " + (Math.round(1000 * missedFrames / expectedFrames) / 10) + "%");
    }
    
    function Timer()
    {
        if (window["TheTimer"] == null)
        {
            window["TheTimer"] = true;
            console.log("Timer started " + (new Date()).toISOString())
            setTimeout(Timer, 1000);
        }
        else if (window["TheTimer"] == true)
        {
            console.log("Timer checked in " + (new Date()).toISOString())
            setTimeout(Timer, 1000);            
        }
        else if (window["TheTimer"] == false)
        {
            window["TheTimer"] = null;
        }
    }


    export function TestCase1(testData: Array<Person> | any, callback?: (sync: number, clone: number, serialization: number) => void)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();
        // StartFrameCounter();
        var result = testData.Where(z => z.FirstName.length % 2 == 0).Select(z => z).ToList();
        var result1Time = new Date().getTime();
        // StopFrameCounter();
        // StartFrameCounter();
        testData.AsParallel().Where(z => z.FirstName.length % 2 == 0).Select(z => z).ToList().catch(ex => console.error(ex)).then(z =>
        {
            var result2Time = new Date().getTime();

            // StopFrameCounter();                    

            Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";
            // StartFrameCounter();
            testData.AsParallel().Where(z => z.FirstName.length % 2 == 0).Select(z => z).ToList().catch(ex => console.error(ex)).then(z =>
            {

                var result3Time = new Date().getTime();
                // StopFrameCounter();
                console.log("Simple", result1Time - start);
                console.log("Parallel with Clone", result2Time - result1Time);
                console.log("Parallel with TypedSerialization", result3Time - result2Time);

                if (callback != null)
                    callback(result1Time - start, result2Time - result1Time, result3Time - result2Time);
            });            
        });        
    }


    export function TestCase1a(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        var start = new Date().getTime();
        var result = testData.Where(z => z.FirstName.length % 2 == 0).Select(z => z).ToList();
        var result1Time = new Date().getTime();
         console.log("Simple", result1Time - start);
    }

    export function TestCase1b(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var result1Time = new Date().getTime();
        testData.AsParallel().Where(z => z.FirstName.length % 2 == 0).Select(z => z).ToList().catch(ex => console.error(ex)).then(z =>
        {
            var result2Time = new Date().getTime();
            console.log("Parallel with Clone", result2Time - result1Time);
        });        
    }

    export function TestCase1c(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

            var result2Time = new Date().getTime();

            // StopFrameCounter();                    

            Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";
            // StartFrameCounter();
            testData.AsParallel().Where(z => z.FirstName.length % 2 == 0).Select(z => z).ToList().catch(ex => console.error(ex)).then(z =>
            {

                var result3Time = new Date().getTime();

                console.log("Parallel with TypedSerialization", result3Time - result2Time);
            });            
    }    

    export function TestCase2(testData: Array<Person> | any, callback?: (sync: number, clone: number, serialization: number) => void)
    {
        var numberOfSimultaneous = 2 * Accelatrix["Tasks"].Config.MaxParallelism as number;

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";
        
        var start = new Date().getTime();

        for (var i = 0; i < numberOfSimultaneous; i++)
        {
            var result = testData.Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children))
                                 .SelectMany(z => z)
                                 .Where(z => z.FirstName.length % 2 == 0)
                                 .Select(z => z.Age)
                                 .Max();        
        }

        var result1Time = new Date().getTime();
        var done = 0;
        for (var i = 0; i < numberOfSimultaneous; i++)
        {
            testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Where(z => z.FirstName.length % 2 == 0).Select(z => z.Age).Max().catch(ex => console.error(ex)).then(w =>
            {
                done++;

                if (done >= numberOfSimultaneous)
                {
                    var result2Time = new Date().getTime();
           
                    Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

                    done = 0;

                    for (var j = 0; j < numberOfSimultaneous; j++)
                    {
                        testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Where(z => z.FirstName.length % 2 == 0).Select(z => z.Age).Max().catch(ex => console.error(ex)).then(z =>
                        {
                            done++;

                            if (done >= numberOfSimultaneous)
                            {
                                var result3Time = new Date().getTime();

                                console.log("Simple", result1Time - start);
                                console.log("Parallel with Clone", result2Time - result1Time);
                                console.log("Parallel with TypedSerialization", result3Time - result2Time);

                                if (callback != null)
                                    callback(result1Time - start, result2Time - result1Time, result3Time - result2Time);                                
                            }
                        }); 
                    }
                }          
            });
        }        
    }

    export function TestCase2a(testData: Array<Person> | any)
    {
        var numberOfSimultaneous = 2 * Accelatrix["Tasks"].Config.MaxParallelism as number;

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";
        
        var start = new Date().getTime();

        for (var i = 0; i < numberOfSimultaneous; i++)
        {
            var result = testData.Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children))
                                 .SelectMany(z => z)
                                 .Where(z => z.FirstName.length % 2 == 0)
                                 .Select(z => z.Age)
                                 .Max();        
        }

        var result1Time = new Date().getTime();
        console.log("Simple", result1Time - start);
    }

    export function TestCase2b(testData: Array<Person> | any)
    {
        var numberOfSimultaneous = 2 * Accelatrix["Tasks"].Config.MaxParallelism as number;

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";
        
    
        var result1Time = new Date().getTime();
        var done = 0;
        for (var i = 0; i < numberOfSimultaneous; i++)
        {
            testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Where(z => z.FirstName.length % 2 == 0).Select(z => z.Age).Max().catch(ex => console.error(ex)).then(w =>
            {
                done++;

                if (done >= numberOfSimultaneous)
                {
                    var result2Time = new Date().getTime();
           
                    Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

                    done = 0;

    
                                console.log("Parallel with Clone", result2Time - result1Time);
                }          
            });
        }        
    }    

    export function TestCase2c(testData: Array<Person> | any)
    {
        var numberOfSimultaneous = 2 * Accelatrix["Tasks"].Config.MaxParallelism as number;

                    var result2Time = new Date().getTime();
           
                    Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

                    var done = 0;

                    for (var j = 0; j < numberOfSimultaneous; j++)
                    {
                        testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Where(z => z.FirstName.length % 2 == 0).Select(z => z.Age).Max().catch(ex => console.error(ex)).then(z =>
                        {
                            done++;

                            if (done >= numberOfSimultaneous)
                            {
                                var result3Time = new Date().getTime();
                                console.log("Parallel with TypedSerialization", result3Time - result2Time);
                            }
                        });
                    }        
    }

    export function TestCase3(testData: Array<Person> | any, callback?: (sync: number, clone: number, serialization: number) => void)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();

        var result = testData.Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children))
                             .SelectMany(z => z)
                             .Select(z => ({ ...z, Children: null}))
                             .Distinct()
                             .ToList();

        var result1Time = new Date().getTime();

        testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Select(z => ({ ...z, Children: null})).Distinct().ToList().catch(ex => console.error(ex)).then(z =>
        {
            var result2Time = new Date().getTime();

            Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

            testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Select(z => ({ ...z, Children: null})).Distinct().ToList().catch(ex => console.error(ex)).then(w =>
            {
                var result3Time = new Date().getTime();
                console.log("Simple", result1Time - start);
                console.log("Parallel with Clone", result2Time - result1Time);
                console.log("Parallel with TypedSerialization", result3Time - result2Time);

                if (callback != null)
                    callback(result1Time - start, result2Time - result1Time, result3Time - result2Time);                
            });            
        });        
    }

    export function TestCase3a(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();

        var result = testData.Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children))
                             .SelectMany(z => z)
                             .Select(z => ({ ...z, Children: null}))
                             .Distinct()
                             .ToList();

        var result1Time = new Date().getTime();

    
                console.log("Simple", result1Time - start);
    }

    export function TestCase3b(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var result1Time = new Date().getTime();

        testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Select(z => ({ ...z, Children: null})).Distinct().ToList().catch(ex => console.error(ex)).then(z =>
        {
            var result2Time = new Date().getTime();

                console.log("Parallel with Clone", result2Time - result1Time);
        });        
    }    


    export function TestCase3c(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

            var result2Time = new Date().getTime();

            Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

            testData.AsParallel().Select(z => Object.FlattenHierarchy(z, (w: any) => w.Children)).SelectMany(z => z).Select(z => ({ ...z, Children: null})).Distinct().ToList().catch(ex => console.error(ex)).then(w =>
            {
                var result3Time = new Date().getTime();
                console.log("Parallel with TypedSerialization", result3Time - result2Time);
        });        
    }  

    export function TestCase4(populationSize: Array<Person> | number, callback?: (sync: number, clone: number, serialization: number) => void)
    {
        if (populationSize == null)
            throw new Error("No populationSize specified.");

        if (populationSize["length"] != null)
            populationSize = populationSize["length"];

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();

        var testData = self["GenPopulation"](populationSize);

        var result = testData.Select(z =>
                                    ({ 
                                        Person: z,
                                        Descendants: Object.FlattenHierarchy(z, (w: any) => w.Children).ToList()    
                                    }))
                             .SelectMany(z => z.Descendants)
                             .Select(z => ({ ...z, Children: null}))
                             .GroupBy(z => z.Age)
                             .Select(z => ({ Age: z.Key, People: z.ToList() }))
                             .ToList();

        var result1Time = new Date().getTime();

        Accelatrix["Collections"].Enumerable.Range(0, populationSize)
                                            .AsParallel()
                                            .ToEnumerable()
                                            .Select(w =>
                                            {
                                                return w.Count().ContinueWith(count =>
                                                {
                                                    var testData = self["GenPopulation"](count);
                                                    var result = testData.Select(z =>
                                                                                ({ 
                                                                                    Person: z,
                                                                                    Descendants: Object.FlattenHierarchy(z, (w: any) => w.Children).ToList()    
                                                                                }))
                                                                        .SelectMany(z => z.Descendants)
                                                                        .Select(z => ({ ...z, Children: null}))
                                                                        .GroupBy(z => z.Age)
                                                                        .Select(z => ({ Age: z.Key, People: z.ToList() }))
                                                                        .ToList();
    
                                                    return result;
                                                });
                                            })
                                            .SelectMany(z => z)
                                            .ToList()
                                            .catch(ex => console.error(ex))
                                            .then(a =>
                                            {
                                                var consolidated = a.GroupBy(w => w.Age)
                                                                    .Select(w => ({ Age: w.Key, People: w.SelectMany(x => x.People).ToList() }))
                                                                    .ToList();

                                                var result2Time = new Date().getTime();

                                                Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

                                                Accelatrix["Collections"].Enumerable.Range(0, populationSize)
                                                                                    .AsParallel()
                                                                                    .ToEnumerable()
                                                                                    .Select(w =>
                                                                                    {
                                                                                        return w.Count().ContinueWith(count =>
                                                                                        {
                                                                                            //console.log("Count", count);
                                                                                            var testData = self["GenPopulation"](count);
                                                                                            var result = testData.Select(z =>
                                                                                                                        ({ 
                                                                                                                            Person: z,
                                                                                                                            Descendants: Object.FlattenHierarchy(z, (w: any) => w.Children).ToList()    
                                                                                                                        }))
                                                                                                                .SelectMany(z => z.Descendants)
                                                                                                                .Select(z => ({ ...z, Children: null}))
                                                                                                                .GroupBy(z => z.Age)
                                                                                                                .Select(z => ({ Age: z.Key, People: z.ToList() }))
                                                                                                                .ToList();
    
                                                                                            return result;
                                                                                        })
                                                                                    })
                                                                                    .SelectMany(z => z)
                                                                                    .ToList()
                                                                                    .catch(ex => console.error(ex))
                                                                                    .then(b =>
                                                                                    {
                                                                                        var consolidated = b.GroupBy(w => w.Age)
                                                                                                            .Select(w => ({ Age: w.Key, People: w.SelectMany(x => x.People).ToList() }))
                                                                                                            .ToList();

                                                                                        var result3Time = new Date().getTime();

                                                                                        console.log(consolidated.OrderBy(z => z.Age));

                                                                                        var result3Time = new Date().getTime();
                                                                                        console.log("Simple", result1Time - start);
                                                                                        console.log("Parallel with Clone", result2Time - result1Time);
                                                                                        console.log("Parallel with TypedSerialization", result3Time - result2Time);
                                                                                        
                                                                                        if (callback != null)
                                                                                            callback(result1Time - start, result2Time - result1Time, result3Time - result2Time);                                                                                          
                                                                                    });

                                            });        
    }

    export function TestCase4a(populationSize: number)
    {
        if (populationSize == null)
            throw new Error("No populationSize specified.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();

        var testData = self["GenPopulation"](populationSize);

        var result = testData.Select(z =>
                                    ({ 
                                        Person: z,
                                        Descendants: Object.FlattenHierarchy(z, (w: any) => w.Children).ToList()    
                                    }))
                             .SelectMany(z => z.Descendants)
                             .Select(z => ({ ...z, Children: null}))
                             .GroupBy(z => z.Age)
                             .Select(z => ({ Age: z.Key, People: z.ToList() }))
                             .ToList();

        var result1Time = new Date().getTime();
                                                                                        console.log("Simple", result1Time - start);

    }

    export function TestCase4b(populationSize: number)
    {
        if (populationSize == null)
            throw new Error("No populationSize specified.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var result1Time = new Date().getTime();

        Accelatrix["Collections"].Enumerable.Range(0, populationSize)
                                            .AsParallel()
                                            .ToEnumerable()
                                            .Select(w =>
                                            {
                                                return w.Count().ContinueWith(count =>
                                                {
                                                    var testData = self["GenPopulation"](count);
                                                    var result = testData.Select(z =>
                                                                                ({ 
                                                                                    Person: z,
                                                                                    Descendants: Object.FlattenHierarchy(z, (w: any) => w.Children).ToList()    
                                                                                }))
                                                                        .SelectMany(z => z.Descendants)
                                                                        .Select(z => ({ ...z, Children: null}))
                                                                        .GroupBy(z => z.Age)
                                                                        .Select(z => ({ Age: z.Key, People: z.ToList() }))
                                                                        .ToList();
    
                                                    return result;
                                                });
                                            })
                                            .SelectMany(z => z)
                                            .ToList()
                                            .catch(ex => console.error(ex))
                                            .then(a =>
                                            {
                                                var consolidated = a.GroupBy(w => w.Age)
                                                                    .Select(w => ({ Age: w.Key, People: w.SelectMany(x => x.People).ToList() }))
                                                                    .ToList();

                                                var result2Time = new Date().getTime();


                                                                                        console.log("Parallel with Clone", result2Time - result1Time);

                                            });        
    }

    export function TestCase4c(populationSize: number)
    {
        if (populationSize == null)
            throw new Error("No populationSize specified.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";


                                                var result2Time = new Date().getTime();

                                                Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

                                                Accelatrix["Collections"].Enumerable.Range(0, populationSize)
                                                                                    .AsParallel()
                                                                                    .ToEnumerable()
                                                                                    .Select(w =>
                                                                                    {
                                                                                        return w.Count().ContinueWith(count =>
                                                                                        {
                                                                                            //console.log("Count", count);
                                                                                            var testData = self["GenPopulation"](count);
                                                                                            var result = testData.Select(z =>
                                                                                                                        ({ 
                                                                                                                            Person: z,
                                                                                                                            Descendants: Object.FlattenHierarchy(z, (w: any) => w.Children).ToList()    
                                                                                                                        }))
                                                                                                                .SelectMany(z => z.Descendants)
                                                                                                                .Select(z => ({ ...z, Children: null}))
                                                                                                                .GroupBy(z => z.Age)
                                                                                                                .Select(z => ({ Age: z.Key, People: z.ToList() }))
                                                                                                                .ToList();
    
                                                                                            return result;
                                                                                        })
                                                                                    })
                                                                                    .SelectMany(z => z)
                                                                                    .ToList()
                                                                                    .catch(ex => console.error(ex))
                                                                                    .then(b =>
                                                                                    {
                                                                                        var consolidated = b.GroupBy(w => w.Age)
                                                                                                            .Select(w => ({ Age: w.Key, People: w.SelectMany(x => x.People).ToList() }))
                                                                                                            .ToList();

                                                                                        var result3Time = new Date().getTime();

                                                                                        console.log(consolidated.OrderBy(z => z.Age));

                                                                                        var result3Time = new Date().getTime();
                                                                                        console.log("Parallel with TypedSerialization", result3Time - result2Time);
                                                                                        

                                            });        
    }    

    export function TestCase5(testData: Array<Person> | any, callback?: (sync: number, clone: number, serialization: number) => void)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();

        var result = "<ol>" + testData.Select(z => "<li>" + Person.Render(z) + "</li>").ToList().join("") + "</ol>";

        var result1Time = new Date().getTime();
//console.log(result);
        testData.AsParallel().Select(z => "<li>" + Person.Render(z) + "</li>").ToList().catch(ex => console.error(ex)).then(z =>
        {
            var result2 = "<ol>" + z.join("") + "</ol>";
            var result2Time = new Date().getTime();

            Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

            testData.AsParallel().Select(z => "<li>" + Person.Render(z) + "</li>").ToList().catch(ex => console.error(ex)).then(w =>
            {
                var result3 = "<ol>" + w.join("") + "</ol>";
                var result3Time = new Date().getTime();
                console.log("Simple", result1Time - start);
                console.log("Parallel with Clone", result2Time - result1Time);
                console.log("Parallel with TypedSerialization", result3Time - result2Time);

                if (callback != null)
                    callback(result1Time - start, result2Time - result1Time, result3Time - result2Time);                  
            });            
        });        
    }

    export function TestCase5a(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        Accelatrix["Tasks"].Config.DataPassingMethod = "Clone";

        var start = new Date().getTime();

        var result = "<ol>" + testData.Select(z => "<li>" + Person.Render(z) + "</li>").ToList().join("") + "</ol>";

        var result1Time = new Date().getTime();
    }    

    export function TestCase5b(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

        var result1Time = new Date().getTime();
//console.log(result);
        testData.AsParallel().Select(z => "<li>" + Person.Render(z) + "</li>").ToList().catch(ex => console.error(ex)).then(z =>
        {
            var result2 = "<ol>" + z.join("") + "</ol>";
            var result2Time = new Date().getTime();

                console.log("Parallel with Clone", result2Time - result1Time);

            });        
    }    

    export function TestCase5c(testData: Array<Person> | any)
    {
        if (testData == null || !testData.Any())
            throw new Error("No test data. Please use the GenPopulation() function.");

            var result2Time = new Date().getTime();

            Accelatrix["Tasks"].Config.DataPassingMethod = "TypedSerialization";

            testData.AsParallel().Select(z => "<li>" + Person.Render(z) + "</li>").ToList().catch(ex => console.error(ex)).then(w =>
            {
                var result3 = "<ol>" + w.join("") + "</ol>";
                var result3Time = new Date().getTime();
                console.log("Parallel with TypedSerialization", result3Time - result2Time);
            });            
    }

    
    export function EvaluateTestCase4(testData: Array<Person>, groupBy: (z: Person) => number, onGroupCreated?: (key: number) => boolean, onMemberCreated?: (group: {[key: number]: Array<Person>}, member: Person) => boolean)
    {
        var flatHierarchies = testData.map(z => Object.FlattenHierarchy(z, (a: any) => a.Children).ToList());
        var flat = [];

        for (var i = 0; i < flatHierarchies.length; i++)
            for (var j = 0; j < flat[i].length; j++)
                flat.push({ ...flat[i][j]});

        var result = [];
        for (var i = 0; i < flat.length; i++)
        {
            var key = groupBy(flat[i]);
            var keyExists = false;
            
            for (var j = 0; j < result.length; j++)
            {
                if (Object.AreEqual(result[j].Key, key))
                {
                    keyExists = true;
                    break;
                }
            }

            if (!keyExists)
            {
                var newGroup = [ flat[i] ];
                Object.defineProperty(newGroup, "Key", { enumerable: true, get: () => key});
                result.push(newGroup);

                if (onGroupCreated != null && !onGroupCreated(key))
                    break;

                if (onMemberCreated != null && !onMemberCreated(newGroup, flat[i]))
                    break;                
            }
            else
            {
                result[j].push(flat[i]);

                if (onMemberCreated != null && !onMemberCreated(result[j], flat[i]))
                    break;                      
            }
        }

        return result;
    }


    export function EvaluateTestCase3(testData: Array<Person>, resultCallback: (result: any) => void)
    {
        const NUMBER_OF_WORKERS = 2;

        // Scripts to feed to Web Worker        

        var getScripts = (callback: (scriptContents: string) => void) =>
        {
            var scriptContents = "";

            var scripts = document.querySelectorAll("script");
         
            var pending = 0;
            for (var i = 0; i < scripts.length; i++)
            {
                if (scripts[i].innerText != null && scripts[i].innerText.trim().length > 0)
                    scriptContents += scripts[i].innerText + "\n";
                else
                {
                    pending++;
                    pullScriptData(scripts[i].getAttribute("src"), true, (r, ex) =>
                    {
                        if (ex != null)
                            throw ex;

                        scriptContents += r + "\n";
                        pending--;
                        if (pending <= 0 && callback != null)                   
                            callback(scriptContents);
                    });                  
                }

                if (pending <= 0 && callback != null)                   
                    callback(scriptContents);                
            }
        }

        var pullScriptData = (url: string, cache: boolean, callback: (result: string, error: any) => void) =>
        {
            var xmlhttp;
    
            try
            {
                xmlhttp = self["XMLHttpRequest"] != null
                          ? new XMLHttpRequest()
                          : new self["ActiveXObject"]("Microsoft.XMLHTTP");
            }
            catch (e)
            {
                callback(null, e);
                return;
            }
    
            xmlhttp.onreadystatechange = function ()
            {
                if (xmlhttp == null) return; //page is being destroyed
    
                if (xmlhttp.readyState == XMLHttpRequest.DONE)
                {
                    if (xmlhttp.status == 200)
                    {
                        callback(xmlhttp.responseText, null);
                    }
                    else
                    {
                        var errorObj;
                        try
                        {
                            errorObj = JSON.parse(xmlhttp.responseText);
                        }
                        catch (e)
                        {
                            errorObj = xmlhttp.responseText;
                        }
    
                        callback(null, errorObj);
                    }
                }
            };
    
            if (!cache) url += "?_" + Math.random();
    
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        }

        var spawnWorker = (callback: (worker: Worker) => void) =>
        {
            // logic
            var innerLogic = function __WebWorkListen()
            {               
                self.addEventListener("message", message =>
                {

                    var doLocalDistinct = function (testData)
                    {
                        if (testData == null) testData = [];
                        var localDistinct = [];                    
                        for (var i = 0; i < testData.length; i++)
                        {
                            var found = false;
                            for (var j = 0; j < localDistinct.length; j++)
                            {                     
                                if (Object.AreEqual(testData[i], localDistinct[j]))
                                {
                                    found = true;
                                    break;
                                }
                            }
        
                            if (!found)
                                localDistinct.push(testData[i]);
                        }
        
                        return localDistinct;
                    };


                    if (message.data != null && message.data.Operation == "Distinct")
                    {
                        var testData = message.data.Data;
                        var localDistinct = doLocalDistinct(testData);
                        self["__Pending"] = localDistinct.map(function(z) { return ({ Element: z, Hash: z == null ? 0 : z.GetHashCode()}) });
                        self.postMessage({ Operation: "LocalDistinct", Data: self["__Pending"].map(z => z.Hash) }, null);
                    }
                    else if (message.data != null && message.data.Operation == "SendResult")
                    {
                        var hashesTaken = message.data.Data;
                        var whatToSend = [];
                        for (var i = 0; i < self["__Pending"].length; i++)
                        {
                            var filterOut = false;
                            for (var j = 0; j < hashesTaken.length; j++)                                
                                if (self["__Pending"][i].Hash == hashesTaken[j])
                                {
                                    filterOut = true;
                                    break;
                                }
                            if (!filterOut)
                                whatToSend.push(self["__Pending"][i].Element);
                        }

                        self.postMessage({ Operation: "Result", Data: whatToSend}, null);
                    }
                });
            };            

            getScripts(baseScripts =>
            {
                var workerCode = baseScripts + innerLogic.toString() + "\n" + "__WebWorkListen()";

                var newWorker = new Worker("data:text/javascript;charset=US-ASCII," + encodeURIComponent(workerCode));
                if (callback != null) callback(newWorker);
            });
        }

        // split data count
        var elementCount = Math.ceil(testData.length / NUMBER_OF_WORKERS);
        
        //----- volatile stuff ---
        var hashesTaken = [];
        var workers = [];
        var finalResult = [];
        var pendingResultCount = 0;

        // wire logic
        for (var w = 0; w < NUMBER_OF_WORKERS; w++)
        {
            spawnWorker(worker =>
            {
                workers.push(worker);

                worker.addEventListener("error", ex =>
                {
                    throw ex;
                });

                worker.addEventListener("message", message =>
                {
                    if (message.data != null && message.data.Operation == "LocalDistinct")
                    {
                        var alreadyTaken = [];
                        for (var i = 0; i < message.data.Data.length; i++)
                        {
                            var alreadyExists = false;
                            for (var j = 0; j < hashesTaken.length; j++)
                                if (message.data.Data[i] == hashesTaken[j])
                                {
                                    alreadyExists = true;
                                    break;
                                }
        
                            if (!alreadyExists)
                                hashesTaken.push(message.data.Data[i]);
                            else
                                alreadyTaken.push(message.data.Data[i]);
                        }

                        worker.postMessage({ Operation: "SendResult", Data: alreadyTaken })
                    }
                    else if (message.data != null && message.data.Operation == "Result")
                    {
                        for (var i = 0; i < message.data.Data.length; i++)
                            finalResult.push(message.data.Data[i]);

                        pendingResultCount--;
                        if (pendingResultCount == 0)
                        {
                            if (resultCallback != null)
                                resultCallback(finalResult);

                            // clear workers
                            worker.terminate();
                        }
                    }
                });

                // send work
                var dataToSend = testData.splice(0, elementCount);
                pendingResultCount++;
                worker.postMessage({ Operation: "Distinct", Data: dataToSend }, null);
            });
        }
    }
   
}




