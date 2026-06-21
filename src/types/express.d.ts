/**
 * Augments Express's Request type. Per Folder Structure Guide,
 * src/types/express.d.ts.
 *
 * req.user is populated by auth.middleware.ts once the Authentication
 * module is implemented — declared here now so other modules can
 * type against it from day one without circular imports.
 */
declare namespace Express {
  export interface Request {
    requestId: string;
    user?: {
      id: string;
      email: string;
      role: "user" | "admin";
    };
  }
}
