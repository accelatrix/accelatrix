import { Accelatrix } from "www/framework/Base";
import { Accelatrix as  Accelatrix2 } from "www/framework/Number";

function GenPopulation(members: number, freeze: boolean, dropTypes?: boolean)
{      
   
  const maxUsersInLevel = Math.ceil(members * 0.00001);
  const duplicationFactor = 3;
  const countryCodes = ["AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR",
  "AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ",
  "BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI",
  "KH","CM","CA","CV","KY","CF","TD","CL","CN","CX","CC","CO","KM",
  "CG","CD","CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM",
  "DO","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR",
  "GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP",
  "GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS",
  "IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ",
  "KE","KI","KP","KR","XK","KW","KG","LA","LV","LB","LS","LR","LY",
  "LI","LT","LU","MO","MK","MG","MW","MY","MV","ML","MT","MH","MQ",
  "MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM",
  "NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP",
  "NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT",
  "PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC",
  "WS","SM","ST","SA","SN","RS","CS","SC","SL","SG","SX","SK","SI",
  "SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SZ","SE","CH",
  "SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM",
  "TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VE","VN",
  "VG","VI","WF","EH","YE","ZM","ZW"];

  const now = new Date();          

  const genText = (size) =>
  {
    
      var result = "";
      for (var i = 0; i < size; i++)
      { 
        let rnd = Math.round(Math.random() * 25);
        let char = String.fromCharCode((i == 0 ? 65 : 97) + rnd);
        result += char;
      }
      return result;
  }

  const genRandomPerson = () =>
  {
     var birthDate = new Date(Math.random() * 1674640860422);

     return {
              "$type": dropTypes ? null : "Person",
              FirstName: genText(5 + Math.ceil(Math.random() * 6)),
              LastName: genText(5 + Math.ceil(Math.random() * 6)),
              BirthDate: birthDate,
              Age: now.getFullYear() - birthDate.getFullYear(), // approx
              IsMale: Math.random() <= 0.5,
              Height: { 
                        "$type": dropTypes ? null : "Quantity",
                        Amount: Math.round((Math.random() * 80) * 10)/10 + 140,
                        Precision: 10,
                        Unit: { "$type": dropTypes ? null : "LengthUnit", Code: "cm" }
                     },
              MonthlyDisposableIncome: { 
                                            "$type": dropTypes ? null : "Quantity",
                                            Amount: Math.round((Math.random() * 800) *  
                                                                        100)/100 + 500,
                                                                Precision: 100,
                                            Unit: {
                                                    "$type": dropTypes ? null : "Unit",
                                                    Code: "EUR",
                                                    Name: "Euro" 
                                                  }
                                      },
              Country: countryCodes[Math.abs(Math.round(Math.random() * countryCodes.length) - 1)],
              Children: [],
            }
  } // end: genRandomPerson

  const depthLevel = 2;
  var lastOutput = null;
  var result = [];
  
  for (var i = 0; i < members; i++)
  {
      const getPerson = () =>
                        {
                           var newPerson = genRandomPerson(); 
                           const person = (i % duplicationFactor == 0) && lastOutput != null
                                          ? { ...lastOutput, Children: [] }
                                          : newPerson;

                           if (freeze) Accelatrix.ImmutableObject.Freeze(person, true);

                           lastOutput = newPerson;

                           return person;
                        }

      const addLevel = (person, depthCount, currentDepth) =>
                       {
                          const nDescendants = Math.round(Math.random() * maxUsersInLevel);

                          for (var d = 0; d < nDescendants; d++)
                          {
                             if (i >= members)
                              break;

                             var newPerson = getPerson();
                             person.Children.push(newPerson);
                             i++;

                             if (currentDepth < depthCount)
                              addLevel(newPerson, depthCount, currentDepth + 1);
                          }
                       }

      var person = getPerson();

      result.push(person);

      const nLevels = Math.round(Math.random() * depthLevel);

      addLevel(person, nLevels, 0);
  }

  return result;
}

/** Depicts a person for testing purposes. */
export class Person
{
    public $type = "Person";
    public FirstName: string;
    public LastName: string;
    public Age: Number;
    public BirthDate: Date;
    public Children: Array<Person>;
    public Country: string;
    public Height: Accelatrix2.IQuantity<Accelatrix2.IUnit>;
    public IsMale: boolean;
    public MonthlyDisposableIncome: Accelatrix2.IQuantity<Accelatrix2.IUnit>;

    constructor(firstName: string, lastName: string, age: number, birthDate: Date, isMale: boolean, country: string, height: Accelatrix2.IQuantity<Accelatrix2.IUnit>, monthlyDisposableIncome: Accelatrix2.IQuantity<Accelatrix2.IUnit>, children: Array<Person>)
    {
      this.FirstName = firstName;
      this.LastName = lastName;
      this.Age = age;
      this.BirthDate = birthDate;
      this.IsMale = isMale;
      this.Country = country;
      this.Height = height;
      this.MonthlyDisposableIncome = monthlyDisposableIncome;
      this.Children = children;
    }

static Render(person: Person): string
{
   var template = `<div>
   <label>Display name</label><span>{1}, {0}</span>
   <label>Born on</label><span>{2}</span><span>({3})</span>
   <label for="Gender">Gender</label><label for="GenderMale">Male <input id="Male" name="Gender" type="radio" value="Male" {4}></label><label for="GenderFemale">Female <input id="Female" name="Gender" type="radio" value="Female" {5}></label>
   <label>Country code</label><span>{6}</span>
   <label>Height</label><span>{7}</span>
   <label>MonthlyDisposableIncome</label><span>{8}</span>
   {9}
</div>`;

   return template.Format(person.FirstName,
                           person.LastName,
                           person.BirthDate.ToString(),
                           person.Age,
                           person.IsMale ? "checked" : "",
                           person.IsMale ? "" : "checked",
                           person.Country,
                           person.Height.ToString(),
                           person.MonthlyDisposableIncome.ToString(),
                           person.Children == null || person.Children.length == 0
                           ? ""
                           : "<label>Children</label><ol>" + person.Children.Select(z => "<li>" + Person.Render(z) + "</li>").ToList().join("") + "</ol>")
}
}

export class LengthUnit
{
   public $type = "LengthUnit";
   public Code: string;
   public Name: string;
   public ShortName: string;

   public constructor(code: string, name: string, shortName: string)
   {
    
    this.Code = code;
    this.Name = name;
    this.ShortName = shortName;
    
   }
}

export class Currency extends LengthUnit
{

}
