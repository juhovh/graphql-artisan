import schema, { User } from "./schema";

export default schema.query("testQuery").select(User.id());
