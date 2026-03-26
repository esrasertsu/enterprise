using Ecommerce.Application.Abstractions.Notifications;
using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using FluentValidation;

namespace Ecommerce.Application.QuoteRequests;

public sealed class QuoteRequestSubmissionService
{
    private readonly IAppDbContext _dbContext;
    private readonly IValidator<SubmitQuoteRequestCommand> _validator;
    private readonly IAdminQuoteRequestNotifier _adminQuoteRequestNotifier;

    public QuoteRequestSubmissionService(
        IAppDbContext dbContext,
        IValidator<SubmitQuoteRequestCommand> validator,
        IAdminQuoteRequestNotifier adminQuoteRequestNotifier)
    {
        _dbContext = dbContext;
        _validator = validator;
        _adminQuoteRequestNotifier = adminQuoteRequestNotifier;
    }

    public async Task<Guid> SubmitAsync(SubmitQuoteRequestCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var quoteRequest = new QuoteRequest
        {
            FullName = command.FullName.Trim(),
            Email = command.Email.Trim(),
            Phone = string.IsNullOrWhiteSpace(command.Phone) ? null : command.Phone.Trim(),
            CompanyName = string.IsNullOrWhiteSpace(command.CompanyName) ? null : command.CompanyName.Trim(),
            ProductName = string.IsNullOrWhiteSpace(command.ProductName) ? null : command.ProductName.Trim(),
            Quantity = command.Quantity,
            Notes = string.IsNullOrWhiteSpace(command.Notes) ? null : command.Notes.Trim(),
            Status = QuoteRequestStatus.New
        };

        _dbContext.QuoteRequests.Add(quoteRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _adminQuoteRequestNotifier.NotifyAsync(command, cancellationToken);

        quoteRequest.AdminNotificationSentAt = DateTime.UtcNow;
        quoteRequest.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return quoteRequest.Id;
    }
}