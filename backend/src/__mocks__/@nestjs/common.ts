export const Injectable = () => (target: any) => target;
export const Controller = () => (target: any) => target;
export const Get = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor;
export const Post = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor;
export const Param = () => (target: any, propertyKey: string, parameterIndex: number) => {};
export const Delete = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor;
export const Body = () => (target: any, propertyKey: string, parameterIndex: number) => {};
export const UseGuards = () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {}; 