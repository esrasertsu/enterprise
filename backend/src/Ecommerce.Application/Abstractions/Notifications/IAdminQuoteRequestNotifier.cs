using Ecommerce.Application.QuoteRequests;

namespace Ecommerce.Application.Abstractions.Notifications;

public interface IAdminQuoteRequestNotifier
{
    Task NotifyAsync(SubmitQuoteRequestCommand command, CancellationToken cancellationToken = default);
}