import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

/**
 * Mandatory legal acceptance control. Unticked by default; the parent
 * form must block the action until `checked` is true and then call
 * `recordLegalAcceptance` once the action succeeds.
 */
const LegalAcceptanceCheckbox = ({
  checked,
  onCheckedChange,
  id = "legal-accept",
  className = "",
}: Props) => {
  const linkCls = "text-accent underline hover:no-underline";
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-1"
        />
        <label
          htmlFor={id}
          className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
        >
          I agree to the{" "}
          <Link to="/legal/terms-of-service" target="_blank" rel="noopener noreferrer" className={linkCls}>Platform Terms</Link>,{" "}
          <Link to="/legal/client-services-agreement" target="_blank" rel="noopener noreferrer" className={linkCls}>Customer Agreement</Link>{" "}
          and incorporated policies, including the{" "}
          <Link to="/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className={linkCls}>Privacy Policy</Link>,{" "}
          <Link to="/legal/data-processing-agreement" target="_blank" rel="noopener noreferrer" className={linkCls}>Data Processing Agreement</Link>,{" "}
          <Link to="/legal/acceptable-use-policy" target="_blank" rel="noopener noreferrer" className={linkCls}>Acceptable Use Policy</Link>{" "}
          and{" "}
          <Link to="/legal/marketing-compliance-policy" target="_blank" rel="noopener noreferrer" className={linkCls}>Marketing Compliance Policy</Link>.
          {" "}See also the{" "}
          <Link to="/legal/cookie-policy" target="_blank" rel="noopener noreferrer" className={linkCls}>Cookie Policy</Link>,{" "}
          <Link to="/legal/platform-security-policy" target="_blank" rel="noopener noreferrer" className={linkCls}>Platform Security Policy</Link>{" "}
          and{" "}
          <Link to="/legal/service-level-agreement" target="_blank" rel="noopener noreferrer" className={linkCls}>Service Level Agreement</Link>.
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground/80 pl-6">
        By continuing, you confirm you have authority to bind the organisation or workspace you are creating.
      </p>
    </div>
  );
};

export default LegalAcceptanceCheckbox;
