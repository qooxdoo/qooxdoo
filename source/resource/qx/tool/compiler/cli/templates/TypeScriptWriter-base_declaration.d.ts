/**
 * Legacy alias for {@link Record}
 */
type IMap = Record<string, any>;

/**
 * Note: this type permits any number
*/
declare type Integer = number;
/**
 * Note: this type permits any number
*/
declare type Double = number;
/**
 * Note: this type permits any number
*/
declare type Float = number;
/**
 * Note: this type permits any number
*/
declare type PositiveInteger = number;
/**
 * Note: this type permits any number
*/
declare type PositiveNumber = number;

/**
 * Note: this type permits any string
 */
declare type Color = string;
/**
 * Note: this type permits any string
 */
declare type Font = string;

declare module qx.registry { 
  function registerMainMethod(fn: (app: qx.application.Standalone) => void): void;
}