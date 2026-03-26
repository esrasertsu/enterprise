using System.Net;
using System.Net.Mail;
using System.Text;
using Ecommerce.Application.Abstractions.Notifications;
using Ecommerce.Application.QuoteRequests;
using Microsoft.Extensions.Configuration;

namespace Ecommerce.Infrastructure.Notifications;

public sealed class SmtpAdminQuoteRequestNotifier : IAdminQuoteRequestNotifier
{
    private readonly IConfiguration _configuration;

    public SmtpAdminQuoteRequestNotifier(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task NotifyAsync(SubmitQuoteRequestCommand command, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var smtpSettings = GetSmtpSettings();
        var adminSettings = GetAdminNotificationSettings();

        if (string.IsNullOrWhiteSpace(smtpSettings.Host) || string.IsNullOrWhiteSpace(smtpSettings.SenderEmail))
        {
            throw new InvalidOperationException("SMTP host and sender email must be configured.");
        }

        if (string.IsNullOrWhiteSpace(adminSettings.QuoteRequestEmail))
        {
            throw new InvalidOperationException("Admin quote request email must be configured.");
        }

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(smtpSettings.SenderEmail, smtpSettings.SenderName),
            Subject = BuildSubject(command),
            Body = BuildBody(command),
            IsBodyHtml = false
        };

        mailMessage.To.Add(adminSettings.QuoteRequestEmail);
        mailMessage.ReplyToList.Add(new MailAddress(command.Email, command.FullName));

        using var smtpClient = new SmtpClient(smtpSettings.Host, smtpSettings.Port)
        {
            EnableSsl = smtpSettings.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        if (!string.IsNullOrWhiteSpace(smtpSettings.Username))
        {
            smtpClient.Credentials = new NetworkCredential(smtpSettings.Username, smtpSettings.Password);
        }

        await smtpClient.SendMailAsync(mailMessage, cancellationToken);
    }

    private SmtpSettings GetSmtpSettings()
    {
        var smtpSection = _configuration.GetSection("Email:Smtp");

        return new SmtpSettings
        {
            Host = smtpSection["Host"] ?? string.Empty,
            Port = int.TryParse(smtpSection["Port"], out var port) ? port : 587,
            SenderEmail = smtpSection["SenderEmail"] ?? string.Empty,
            SenderName = smtpSection["SenderName"] ?? string.Empty,
            Username = smtpSection["Username"],
            Password = smtpSection["Password"],
            EnableSsl = !bool.TryParse(smtpSection["EnableSsl"], out var enableSsl) || enableSsl
        };
    }

    private AdminNotificationSettings GetAdminNotificationSettings()
    {
        var adminSection = _configuration.GetSection("AdminNotifications");

        return new AdminNotificationSettings
        {
            QuoteRequestEmail = adminSection["QuoteRequestEmail"] ?? string.Empty
        };
    }

    private static string BuildSubject(SubmitQuoteRequestCommand command)
    {
        var productSegment = string.IsNullOrWhiteSpace(command.ProductName)
            ? "Yeni teklif talebi"
            : $"Teklif talebi: {command.ProductName.Trim()}";

        return productSegment;
    }

    private static string BuildBody(SubmitQuoteRequestCommand command)
    {
        var builder = new StringBuilder();

        builder.AppendLine("Yeni bir teklif talebi alındı.");
        builder.AppendLine();
        builder.AppendLine($"Ad Soyad: {command.FullName.Trim()}");
        builder.AppendLine($"E-posta: {command.Email.Trim()}");

        if (!string.IsNullOrWhiteSpace(command.Phone))
        {
            builder.AppendLine($"Telefon: {command.Phone.Trim()}");
        }

        if (!string.IsNullOrWhiteSpace(command.CompanyName))
        {
            builder.AppendLine($"Firma: {command.CompanyName.Trim()}");
        }

        if (!string.IsNullOrWhiteSpace(command.ProductName))
        {
            builder.AppendLine($"Urun: {command.ProductName.Trim()}");
        }

        if (command.Quantity.HasValue)
        {
            builder.AppendLine($"Adet: {command.Quantity.Value}");
        }

        if (!string.IsNullOrWhiteSpace(command.Notes))
        {
            builder.AppendLine();
            builder.AppendLine("Notlar:");
            builder.AppendLine(command.Notes.Trim());
        }

        return builder.ToString();
    }
}