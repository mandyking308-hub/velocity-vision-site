import { it } from "vitest";
import { resolveIntent, groupOf } from "@/lib/replyIntent";
import { classifyReply } from "@/lib/replyTriage";
it("dbg", () => {
  for (const s of ["Please remove me from this list","Sounds great, happy to chat next week","Who is the right person for this?","I'm not the right person, the right person is Sam Reed (sam@acme.com).","I'm not the right person for this."]) {
    const c = classifyReply(s).category;
    console.log(JSON.stringify(s), c, groupOf(c));
  }
});
