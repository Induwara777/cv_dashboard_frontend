import EmailComposeWindow from "@/component/EmailComposeWindow";

export default function CandidateEmailPage() {
  // EmailComposeWindow reads the id straight from the browser URL on the
  // client, so no props need passing here.
  return <EmailComposeWindow />;
}
