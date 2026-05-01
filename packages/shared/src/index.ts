export const sharedFunction = (): string => {
  return "Hello from the shared package!";
};

export interface User {
  id: string;
  name: string;
  email: string;
}
