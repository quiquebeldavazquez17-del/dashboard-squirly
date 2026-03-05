import { useState } from "react";
import { ArrowLeft, Save, Key, Database, Globe, FileSpreadsheet, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: { key: string; label: string; type?: string; placeholder?: string }[];
}

const sections: SettingsSection[] = [
  {
    id: "clockify",
    title: "Clockify",
    icon: <Database className="w-4 h-4" />,
    fields: [
      { key: "clockify_api_key", label: "API Key", type: "password", placeholder: "Tu API key de Clockify" },
      { key: "clockify_workspace_id", label: "Workspace ID", placeholder: "ID del workspace" },
      { key: "clockify_project_ids", label: "Project IDs", placeholder: "IDs separados por coma" },
    ],
  },
  {
    id: "stripe",
    title: "Stripe",
    icon: <DollarSign className="w-4 h-4" />,
    fields: [
      { key: "stripe_secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_..." },
      { key: "stripe_webhook_secret", label: "Webhook Secret", type: "password", placeholder: "whsec_..." },
    ],
  },
  {
    id: "meta",
    title: "Meta Ads",
    icon: <Globe className="w-4 h-4" />,
    fields: [
      { key: "meta_access_token", label: "Access Token", type: "password", placeholder: "Token de acceso" },
      { key: "meta_ad_account_id", label: "Ad Account ID", placeholder: "act_XXXXXXXXX" },
    ],
  },
  {
    id: "sheets",
    title: "Google Sheets",
    icon: <FileSpreadsheet className="w-4 h-4" />,
    fields: [
      { key: "sheets_spreadsheet_id", label: "Spreadsheet ID", placeholder: "ID de la hoja" },
      { key: "sheets_service_email", label: "Service Account Email", placeholder: "email@project.iam.gserviceaccount.com" },
      { key: "sheets_private_key", label: "Private Key", type: "password", placeholder: "-----BEGIN PRIVATE KEY-----" },
    ],
  },
  {
    id: "business",
    title: "Configuración de Negocio",
    icon: <Key className="w-4 h-4" />,
    fields: [
      { key: "coste_hora", label: "Coste por hora (€)", placeholder: "35" },
      { key: "costes_fijos", label: "Costes fijos mensuales (€)", placeholder: "4200" },
      { key: "porcentaje_coste_variable", label: "% Coste variable", placeholder: "15" },
      { key: "cogs_global", label: "COGS global (%)", placeholder: "30" },
      { key: "target_cliente", label: "Target de cliente ideal", placeholder: "SaaS B2B, 10-50 empleados..." },
    ],
  },
];

const SettingsPage = () => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Configuración</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {sections.map((section, si) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
            className="kpi-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {section.icon}
              </div>
              <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <Label className="text-xs text-muted-foreground">{field.label}</Label>
                  <Input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={values[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground/50 text-sm"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="flex justify-end">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Save className="w-4 h-4" />
            Guardar configuración
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
