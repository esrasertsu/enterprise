using FluentValidation;

namespace Ecommerce.Application.QuoteRequests;

public sealed class SubmitQuoteRequestCommandValidator : AbstractValidator<SubmitQuoteRequestCommand>
{
    public SubmitQuoteRequestCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(320);

        RuleFor(x => x.Phone)
            .MaximumLength(32);

        RuleFor(x => x.CompanyName)
            .MaximumLength(200);

        RuleFor(x => x.ProductName)
            .MaximumLength(200);

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .When(x => x.Quantity.HasValue);

        RuleFor(x => x.Notes)
            .MaximumLength(4000);
    }
}