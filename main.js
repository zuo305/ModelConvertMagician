import { Component, OnInit } from '@angular/core';

export class InstanceLoader {
  static getInstance<T>(context: Object, name: string, ...args: any[]) : T {
      var instance = Object.create(context[name].prototype);
      instance.constructor.apply(instance, args);
      return <T> instance;
  }
}

export class ModelConverter<T> {

  private _typeMapping: any; 
  private _arrayTypeMapping: any;     
  private _targetObject: any;
  private _propertyMapping: any;
  constructor(type: { new(): T; }) {
      this._targetObject = new type();
      this._typeMapping = this._targetObject.constructor._typeMap;
      this._arrayTypeMapping = this._targetObject.constructor._arrayTypeMap;
      this._propertyMapping = this._targetObject.constructor._propertyMap;
      console.log("typemap",this._typeMapping,this._targetObject.constructor._typeMap);
  }


  sameType(com1: any, com2: any){
    if(typeof com1 === typeof com2 ){
      if(typeof com1 !== "object" ){
        return true;
      }      
      else{
        if(com1.constructor.name === com2.constructor.name){
          return true;
        }
        else 
          return false;
      }
    }
    return false;
  }

  unassignObject(source: any) {
    const targetKeys = Object.keys(this._targetObject);

    Object.keys(source).forEach((key) => {
        if (targetKeys.indexOf(key) === -1) {
        }
        else if(Array.isArray(this._targetObject[key])){
          if (this.sameType(this._targetObject[key][0],source[key][0])) {
             this._targetObject[key] =  source[key];
          }
          else {
             this._targetObject[key] = source[key].map(e=> {
                return new ModelConverter(this._targetObject[key][0].constructor).unassignObject(e);                
             })
          }
       }
        else {
            if (this.sameType(this._targetObject[key],source[key])) {
                this._targetObject[key] = source[key];
            }
            else {
                this._targetObject[key] = new ModelConverter(this._targetObject[key].constructor).unassignObject(source[key]);
            }
        }
    });

    return this._targetObject;

  }

  assignObject(source: any) {

    console.log("_proper",this._propertyMapping);

    if(this._typeMapping){
      Object.keys(this._typeMapping).forEach((key)=>{
        this._targetObject[key] = new ModelConverter(this._typeMapping[key]).assignObject(source[key]);  
      });
    }

    if(this._propertyMapping){
      Object.keys(this._propertyMapping).forEach((key)=>{
        this._targetObject[key] = source[this._propertyMapping[key]];  
      });
    }    

    if(this._arrayTypeMapping){
      Object.keys(this._arrayTypeMapping).forEach((key)=>{
          this._targetObject[key] = source[key].map(e=> {
            return new ModelConverter(this._arrayTypeMapping[key]).assignObject(e);                
         })
      });
    }

      const targetKeys = Object.keys(this._targetObject);
      Object.keys(source).forEach((key) => {

          if (targetKeys.indexOf(key) === -1) {
             if( !this._propertyMapping || Object.values(this._propertyMapping).indexOf(key)===-1){
                this._targetObject[key] = source[key];
             }
          }
          else if(Array.isArray(this._targetObject[key])){
            if (this.sameType(this._targetObject[key][0],source[key][0])) {
               this._targetObject[key] =  source[key];
            }
            else {
               this._targetObject[key] = source[key].map(e=> {
                  return new ModelConverter(this._targetObject[key][0].constructor).assignObject(e);                
               })
            }
         }
          else {
              if (this.sameType(this._targetObject[key],source[key])) {
                  this._targetObject[key] = source[key];
              }
              else {
                  this._targetObject[key] = new ModelConverter(this._targetObject[key].constructor).assignObject(source[key]);
              }
          }
      });

      return this._targetObject;
  }
}

export function propertyMap(sourceProperty:string) {
  return function (target: any, propertyKey: string) {
    if(!target.constructor._propertyMap){
      target.constructor._propertyMap ={};
    } 
    target.constructor._propertyMap[propertyKey] = sourceProperty;
  }
}

export function typeMap(type: any) {
  return function (target: any, propertyKey: string) {
    if(!target.constructor._typeMap){
      target.constructor._typeMap ={};
    } 
    target.constructor._typeMap[propertyKey] = type;
  }
}

export function arrayTypeMap(type: any) {
  return function (target: any, propertyKey: string) {
    if(!target.constructor._arrayTypeMap){
      target.constructor._arrayTypeMap ={};
    } 
    target.constructor._arrayTypeMap[propertyKey] = type;
  }
}

export class MM1{
  name: string;
}

export class MM2{
  arr: number[];
  
  constructor(){
    this.arr = [1,2,3]
  }
}

export class orginModel {
  over: boolean;
  value: string;
  m : MM1[];
}

export class testModel {

  @propertyMap('over')
  name: string;

  @arrayTypeMap(MM2)
  m : MM2[];
  constructor() {
  }
}
 
@Component({
  selector: 'span-test',
  templateUrl: './span-test.component.html',
  styleUrls: ['./span-test.component.scss']
})
export class SpanTestComponent implements OnInit {


  constructor() { }

  ngOnInit() {

    const model = new orginModel();
    model.over = true;
    model.value = "sssdf";
    model.m = [new MM1()];
    model.m[0].name = "dfdd";
    const newModel = new ModelConverter(testModel).assignObject(model);
//    const endModel = new ModelConverter(outModel).unassignObject(newModel);
    // Object.assign(newModel, model);
    console.log("old",model);
    console.log("new",newModel);
  //  console.log("out",endModel);
  }

}
