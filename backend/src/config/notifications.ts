import nodemailer from 'nodemailer';
import { logger } from './logger';

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Configuração do sistema de notificações
export const notificationConfig = {
  email: {
    enabled: true,
    from: process.env.EMAIL_FROM || 'noreply@controleai.com.br',
    templates: {
      welcome: {
        subject: 'Bem-vindo ao ControleAI Vendas',
        template: 'welcome.html'
      },
      passwordReset: {
        subject: 'Redefinição de Senha',
        template: 'password-reset.html'
      },
      saleConfirmation: {
        subject: 'Confirmação de Venda',
        template: 'sale-confirmation.html'
      },
      lowStock: {
        subject: 'Alerta de Estoque Baixo',
        template: 'low-stock.html'
      }
    }
  },
  slack: {
    enabled: process.env.SLACK_WEBHOOK_URL !== undefined,
    webhook: process.env.SLACK_WEBHOOK_URL,
    channel: process.env.SLACK_CHANNEL || '#alerts'
  }
};

// Funções de notificação
export const notifications = {
  // Envia email
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!notificationConfig.email.enabled) return;

    try {
      await transporter.sendMail({
        from: notificationConfig.email.from,
        to,
        subject,
        html
      });

      logger.info('Email enviado com sucesso', {
        to,
        subject
      });
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw error;
    }
  },

  // Envia notificação para Slack
  async sendSlackMessage(message: string): Promise<void> {
    if (!notificationConfig.slack.enabled) return;

    try {
      const response = await fetch(notificationConfig.slack.webhook!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: notificationConfig.slack.channel,
          text: message
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem para Slack: ${response.statusText}`);
      }

      logger.info('Mensagem enviada para Slack com sucesso');
    } catch (error) {
      logger.error('Erro ao enviar mensagem para Slack:', error);
      throw error;
    }
  },

  // Envia notificação de alerta
  async sendAlert(type: string, message: string, details?: any): Promise<void> {
    const alertMessage = `[ALERTA] ${type}: ${message}\nDetalhes: ${JSON.stringify(details, null, 2)}`;

    // Envia para Slack
    await this.sendSlackMessage(alertMessage);

    // Envia email para administradores
    if (notificationConfig.email.enabled) {
      await this.sendEmail(
        'admin@controleai.com.br',
        `[ALERTA] ${type}`,
        `
          <h2>Alerta do Sistema</h2>
          <p><strong>Tipo:</strong> ${type}</p>
          <p><strong>Mensagem:</strong> ${message}</p>
          <p><strong>Detalhes:</strong></p>
          <pre>${JSON.stringify(details, null, 2)}</pre>
        `
      );
    }
  }
}; 