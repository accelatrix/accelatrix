/*************************************************************************
                           Build Process
  
                    > gulp prod     : creates a minified build
                    > gulp          : creates a development build
  
 *************************************************************************
 
                          tested with Node v12.16.0
  
                         Miguel@Ferreira-family.org
  
 *************************************************************************
                               Configuration
 *************************************************************************/

var defaultVersion = "1.0.0";
const targetLocation               = './build';
const targetPackageLocation        = './accelatrix';
const targetTempLocation           = './temp';

const frameworkScripts             = [
                                        './www/framework/**/Base.ts',
                                        './www/framework/**/String.ts',                                        
                                        './www/framework/**/Type.ts',                                        
                                        './www/framework/**/Globalization.ts',
                                        './www/framework/**/Number.ts',
                                        './www/framework/**/Date.ts',
                                        './www/framework/**/Bytes.ts',
                                        './www/framework/**/Enumerable.ts',
                                        './www/framework/**/Collections.ts',
                                        './www/framework/**/Serialization.ts',
                                        './www/framework/**/Async.ts',
                                        './www/framework/**/Tasks.ts',
                                        './www/framework/**/AsyncEnumerable.ts',                                        
                                        './www/framework/**/ParallelQuery.ts',
                                     ];
const webWorkerCode =                [
                                        './www/framework/**/Tasks-WebWorkers.ts'
                                     ];
const testScripts                  = [
                                        './www/scripts/*.ts',
                                     ];
const additionalResources          = [
                                        './www/**/*.*',
                                        '!./www/**/*.ts',
                                        '!./www/package_resources/*.*',
                                     ];
const additionalPackageResources   = [
                                        './www/package_resources/*.*',
                                     ];                                     

/*************************************************************************
                               Gulp Packages
 *************************************************************************/

const { series, parallel, src, dest } = require('gulp');
const del = require('del'); // deletes files
const replace = require('gulp-replace-task');
const inject = require('gulp-inject-string');
const ts = require('gulp-typescript');
const merge = require('merge2');
const uglify = require('gulp-uglify');
const strip = require('gulp-strip-comments');
const gulpif = require('gulp-if');
const wrap = require('gulp-wrap');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const readlineSync = require('readline-sync');
const fs = require("fs");

/*************************************************************************
                                Gulp Tasks
 *************************************************************************/

function ConfirmVersion(cb)
{

    var result = readlineSync.question("What is the version number (default: " + defaultVersion + ")?  ", { hideEchoBack: false });
    defaultVersion = result == null || result.trim().length == 0
                     ? defaultVersion
                     : result;
    cb();
}

function CleanTargetLocation()
{
    return del([targetLocation + '/**', targetTempLocation + '/**', targetPackageLocation + '/*.*']);
}

function RemoveTempLocation()
{
    return del([targetTempLocation + '/**', targetTempLocation, targetLocation + '/**/webworkers*.*', targetPackageLocation + '/**/webworkers*.*']);
}

function BuildAndCompactTypeScripts(isProd, isFramework, source, targetFolder, targetName)
{
    const tsProject = ts.createProject('./tsconfig.json', {});

    const tsResult = src(source)
                        .pipe(tsProject());

    return merge([
                    tsResult.dts.pipe(replace({
                                                patterns: [
                                                            {
                                                                match: /(\/\/\/ \<reference path\=.+)/g,
                                                                replacement: ''
                                                            },
                                                            {
                                                                match: /(import \{.*?\;)/g,
                                                                replacement: ''
                                                            },
                                                            {
                                                                match: /(export \{ .*?\;)/g,
                                                                replacement: ''
                                                            },                                                            
                                                            {
                                                                match: /Accelatrix_Base/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                            {
                                                                match: /Accelatrix_AsyncEnumerable/g,
                                                                replacement: 'Accelatrix'
                                                            },                                                            
                                                            {
                                                                match: /Accelatrix_Async/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                            {
                                                                match: /Accelatrix_Number/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                            {
                                                                match: /Accelatrix_Globalization/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                            {
                                                                match: /Accelatrix_Serialization/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                            {
                                                                match: /Accelatrix_Collections/g,
                                                                replacement: 'Accelatrix'
                                                            },                                                            
                                                            {
                                                                match: /Accelatrix_Type/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                            {
                                                                match: /Accelatrix_Enumerable/g,
                                                                replacement: 'Accelatrix'
                                                            }, 
                                                            {
                                                                match: /AccelatrixEnumerable\./g,
                                                                replacement: 'Accelatrix\.'
                                                            },                                                                                                                         
                                                            {
                                                                match: /Accelatrix_Tasks/g,
                                                                replacement: 'Accelatrix'
                                                            },
                                                        ]
                                              }))
                                .pipe(concat(targetName.replace(".js", ".module.d.ts")))                                
                                .pipe(dest(targetFolder)),
                    tsResult.js
                            .pipe(replace({
                                            patterns: [
                                                        {
                                                            match: /Accelatrix_Base/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },
                                                        {
                                                            match: /Accelatrix_AsyncEnumerable/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },                                                        
                                                        {
                                                            match: /Accelatrix_Async/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },                                                        
                                                        {
                                                            match: /Accelatrix_Globalization/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },
                                                        {
                                                            match: /Accelatrix_Number/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },                                                        
                                                        {
                                                            match: /Accelatrix_Serialization/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },
                                                        {
                                                            match: /Accelatrix_Collections/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },                                                          
                                                        {
                                                            match: /Accelatrix_Type/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },
                                                        {
                                                            match: /Accelatrix_Enumerable/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        }, 
                                                        {
                                                            match: /AccelatrixEnumerable\./g,
                                                            replacement: 'self["Accelatrix"]\.'
                                                        },                                                        
                                                        {
                                                            match: /Accelatrix_Tasks/g,
                                                            replacement: 'self["Accelatrix"]'
                                                        },                                                
                                                        {
                                                            match: /export var /g,
                                                            replacement: 'var '
                                                        },
                                                        {
                                                            match: /(\/\/\/ \<reference path\=.+)/g,
                                                            replacement: ''
                                                        },                                                        
                                                        {
                                                            match: /export function /g,
                                                            replacement: 'function '
                                                        },
                                                        {
                                                            match: /(export \{ .*?\;)/g,
                                                            replacement: ''
                                                        },                                            
                                                        {
                                                            match: /(import \* as .*?\;)/g,
                                                            replacement: ''
                                                        },
                                                        {
                                                            match: /(import \{.*?\;)/g,
                                                            replacement: ''
                                                        },
                                                        {
                                                            match: /(import Globalization.*?\;)/g,
                                                            replacement: ''
                                                        }, 
                                                        {
                                                            match: /(import HtmlUtil.*?\;)/g,
                                                            replacement: ''
                                                        },                                                                                                                                        
                                                        {
                                                            match: /(export default .*?\;)/g,
                                                            replacement: ''
                                                        },                                                   
                                                    ]
                            }))                    
                            .pipe(gulpif(isProd, strip()))
                            .pipe(gulpif(isProd, uglify({ mangle : false })))
                            .pipe(gulpif(!isFramework, wrap('<%= " /* BeginFrmk:" + file.path.replace(file.base, "").replace("\\\\", "") + " */ " %><%= contents %><%= " /* EndFrmk:" + file.path.replace(file.base, "").replace("\\\\", "") + " */ " %>')))
                            .pipe(concat(isProd ? targetName.replace(".js", ".min.js") : targetName))
                            .pipe(dest(targetFolder))
                    ]);
}

function CopyResources()
{
    return src(additionalResources).pipe(dest(targetLocation));    
}

function CopyPackageResources()
{
    return src(additionalPackageResources).pipe(dest(targetPackageLocation));    
}

function FrameworkHeading()
{
    var text = "/* Accelatrix v" + defaultVersion + " */\n";
        text += "/* Copyright (c) 2024 Miguel@Ferreira-family.org */\n";        
        text += "/* License agreement: https://github.com/accelatrix/accelatrix/blob/main/LICENSE.md */\n";
        text += "/* Latest version availabe at: */\n";
        text += "/* •	https://ferreira-family.org/accelatrix/accelatrix.min.js */\n"
        text += "/* •	https://www.npmjs.com/package/accelatrix */\n"
        text += "/* •	https://github.com/accelatrix/accelatrix */\n"
        text += "/* •	https://www.nuget.org/packages/Accelatrix */\n"

    return text;
}

function InjectVersion(location)
{
    return src(location + "/**/*.*")
                .pipe(replace({
                    patterns: [
                                {
                                    match: /"version": "1\.0\.0"/g,
                                    replacement: '"version": "' + defaultVersion + '"'
                                },
                                {
                                    match: /v1\.0\.0/g,
                                    replacement: 'v' + defaultVersion
                                },                                
                                {
                                    match: /Accelatrix.Version="1\.0\.0"/g,
                                    replacement: 'Accelatrix.Version="' + defaultVersion + '"'
                                },
                                {
                                    match: /const Version = "1\.0\.0"/g,
                                    replacement: 'const Version = "' + defaultVersion + '"'
                                },
                                {
                                    match: /Accelatrix v1\.0\.0"/g,
                                    replacement: 'Accelatrix v' + defaultVersion + "'"
                                },
                                {
                                    match: /var Accelatrix,/,
                                    replacement: FrameworkHeading() + 'var Accelatrix,'
                                },                                
                                { // Node support and ES Module support
                                    match: /\(Accelatrix\=Accelatrix\|\|\{\}\)\;/g, // minified
                                    replacement: '(Accelatrix=Accelatrix||{});if("object"==typeof module&&"object"==typeof module.exports)module.exports=Accelatrix;Accelatrix.__esModule=Accelatrix;Accelatrix.Accelatrix=Accelatrix;if(self==null){self={}};self["Accelatrix"]=Accelatrix;'
                                },
                                { // Node support and ES Module support
                                    match: /\(Accelatrix \|\| \(Accelatrix \= \{\}\)\)\;/g, // non minified
                                    replacement:'(Accelatrix || (Accelatrix = {}));if("object"==typeof module&&"object"==typeof module.exports)module.exports=Accelatrix;Accelatrix.__esModule=Accelatrix;Accelatrix.Accelatrix=Accelatrix;if(self==null){self={}};self["Accelatrix"]=Accelatrix;'
                                },                                
                            ]
                }))
            .pipe(dest(location));
}

function AddScriptReference(isProd, targetName)
{    
    return src(targetLocation + '/index.html')
              .pipe(replace({
                                patterns: [
                                            {
                                                match: /<\/head>/g,
                                                replacement: '<script src="scripts/' + (isProd ? targetName.replace(".js", ".min.js") : targetName) + '?v' + (new Date().getTime().toString()) + '"></script>\n</head>'
                                            },
                                        ]
                            }))
             .pipe(dest(targetLocation));
}

function RemoveExportsAndGlobal(source)
{
    return src(source).pipe(replace({
                                    patterns: [
                                                {
                                                    match: /export declare namespace Accelatrix/g,
                                                    replacement: 'declare namespace Accelatrix'
                                                },
                                                {
                                                    match: /export \{\}\;/g,
                                                    replacement: ''
                                                },                                               
                                                {
                                                    match: /^declare global \{\r?\n([\s\S]*?)^\}\r?\n?/gm,
                                                    replacement: '$1'
                                                },
                                                {
                                                    match: /^export interface\s+/gm,
                                                    replacement: 'interface '
                                                },
                                                {
                                                    match: /^module \s+/gm,
                                                    replacement: 'namespace '
                                                },                                                
                                                {
                                                    match: /^([ \t]*)export interface\s+/gm,
                                                    replacement: '$1interface '
                                                },
                                            ]
                                    }))
                      .pipe(rename('accelatrix.d.ts'))
                      .pipe(dest(targetPackageLocation));
}

function IntegrateWebWorkersCode(isProd, frameworkLocation, webworkersLocation)
{
    var fileContent = fs.readFileSync(isProd ? webworkersLocation.replace(".js", ".min.js") : webworkersLocation, "utf8");

    frameworkLocation = isProd ? frameworkLocation.replace(".js", ".min.js") : frameworkLocation;

    return src(frameworkLocation)
                .pipe(replace({
                    patterns: [
                                {
                                    match: /"__WEB_WORKER_CODE__"/,
                                    replacement: '`' + fileContent + '`'
                                }
                            ]
                }))
            .pipe(dest(frameworkLocation.substring(0, frameworkLocation.lastIndexOf("/")), { overwrite: true }));
}

/*************************************************************************
                               Commandline
 *************************************************************************/

  const buildTasks = function BuildProject(isProd)
                     {
                         return series(
                                        function Version(cb)
                                                 { 
                                                    if (isProd)  
                                                        ConfirmVersion(cb);
                                                    else
                                                        cb();
                                                 },
                                        CleanTargetLocation,
                                        parallel(
                                                   function BuildFramework() { return BuildAndCompactTypeScripts(isProd, true, frameworkScripts, targetLocation, "/scripts/framework.js") },
                                                   function BuildWebWorkers() { return BuildAndCompactTypeScripts(isProd, false, webWorkerCode, targetLocation, "/scripts/webworkers.js") },                                                   
                                                   function BuildTestCases() { return BuildAndCompactTypeScripts(isProd, true, testScripts, targetLocation, "/scripts/tests.js") },
                                                   CopyResources
                                                ),
                                        function IntegrateWebWorkers() { return IntegrateWebWorkersCode(isProd, targetLocation + "/scripts/framework.js", targetLocation + "/scripts/webworkers.js") },
                                        function AddFrameworkReference() { return AddScriptReference(isProd, "framework.js") },
                                        function SetVersion() { return InjectVersion(targetLocation + "/scripts") },
                                        function AddTestReference() { return AddScriptReference(isProd, "tests.js") },
                                        RemoveTempLocation,
                                      );
                     };

  const buildPackage = function BuildPackage()
                       {
                         return series(
                                        function Version(cb)
                                        { 
                                            ConfirmVersion(cb);
                                        },                            
                                        CleanTargetLocation,
                                        function BuildFramework() { return BuildAndCompactTypeScripts(true, true, frameworkScripts, targetPackageLocation, "/accelatrix.js") },
                                        function BuildWebWorkers() { return BuildAndCompactTypeScripts(true, true, webWorkerCode, targetPackageLocation, "/webworkers.js") },                                                   
                                        function IntegrateWebWorkers() { return IntegrateWebWorkersCode(true, targetPackageLocation + "/accelatrix.js", targetPackageLocation + "/webworkers.js") },                                                
                                        CopyPackageResources,
                                        function SetVersion() { return InjectVersion(targetPackageLocation) },
                                        function CreateNonMinJs() { return src(targetPackageLocation + "/accelatrix.min.js").pipe(rename('accelatrix.js')).pipe(dest(targetPackageLocation)) },
                                        function CreateAmbientDefinitions() { return RemoveExportsAndGlobal(targetPackageLocation + "/accelatrix.module.d.ts") },
                                        RemoveTempLocation,
                                      );
                       }

 //Prod build
 exports.prod = buildTasks(true);
                        
 // Dev build
 exports.default = buildTasks(false);

 // Build package
 exports.package = buildPackage();