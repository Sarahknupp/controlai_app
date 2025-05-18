/**
 * Global type declarations
 * @module types/global
 * @description Global type definitions and utility types for the application
 */

declare global {
  /**
   * Extended Window interface
   * @interface Window
   */
  interface Window {
    /**
     * Redux DevTools extension instance
     * @type {any}
     */
    __REDUX_DEVTOOLS_EXTENSION__?: any;

    /**
     * Redux DevTools extension compose function
     * @type {any}
     */
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }

  /**
   * Makes a type nullable (type | null)
   * @template T - The type to make nullable
   * @example
   * type NullableString = Nullable<string>; // string | null
   */
  type Nullable<T> = T | null;

  /**
   * Makes a type optional (type | undefined)
   * @template T - The type to make optional
   * @example
   * type OptionalNumber = Optional<number>; // number | undefined
   */
  type Optional<T> = T | undefined;

  /**
   * Gets the type of values in an object
   * @template T - The object type
   * @example
   * type Status = { active: boolean, inactive: boolean };
   * type StatusValue = ValueOf<Status>; // boolean
   */
  type ValueOf<T> = T[keyof T];

  /**
   * Makes all properties in an object optional recursively
   * @template T - The type to make partially optional
   * @example
   * interface User { name: string; settings: { theme: string } }
   * type PartialUser = DeepPartial<User>;
   * // { name?: string; settings?: { theme?: string } }
   */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
}

export {};