import {
  Zap, Shield, Sprout, UtensilsCrossed, Building2, Rocket, Lock,
  Cpu, Eye, Cloud, Database, FlaskConical, Hammer, Handshake, Gavel,
  LineChart, History, ScrollText, FileText, Target, Briefcase,
  FolderOpen, Sparkles, Workflow, Wrench,
  type LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Zap, Shield, Sprout, UtensilsCrossed, Building2, Rocket, Lock,
  Cpu, Eye, Cloud, Database, FlaskConical, Hammer, Handshake, Gavel,
  LineChart, History, ScrollText, FileText, Target, Briefcase,
  FolderOpen, Sparkles, Workflow, Wrench,
};

interface Props extends LucideProps {
  name: string;
}

const ProductIcon = ({ name, ...props }: Props) => {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon {...props} />;
};

export default ProductIcon;
