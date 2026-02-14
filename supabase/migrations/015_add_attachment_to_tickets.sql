-- Adiciona campo de anexo aos tickets
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;


