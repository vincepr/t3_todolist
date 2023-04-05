import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";

let opts = authOptions
opts.theme = {
    colorScheme: "dark",
    brandColor: "#cc66ff",
}

export default NextAuth(opts);
