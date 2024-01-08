/**
 * Legacy alias for {@link Record}
 */
type IMap = Record<string, any>;

/**
 * Note: this type permits any JavaScript number
*/
declare type Integer = number;
/**
 * Note: this type permits any JavaScript number
*/
declare type Double = number;
/**
 * Note: this type permits any JavaScript number
*/
declare type Float = number;
/**
 * Note: this type permits any JavaScript number
*/
declare type PositiveInteger = number;
/**
 * Note: this type permits any JavaScript number
*/
declare type PositiveNumber = number;


declare module qx.registry { 
  function registerMainMethod(fn:(app: qx.application.Standalone)=>void):void;
}