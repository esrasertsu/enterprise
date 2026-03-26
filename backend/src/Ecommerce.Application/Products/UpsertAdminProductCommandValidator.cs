using FluentValidation;

namespace Ecommerce.Application.Products;

public sealed class UpsertAdminProductCommandValidator : AbstractValidator<UpsertAdminProductCommand>
{
    public UpsertAdminProductCommandValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty();

        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.SkuRoot)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.MinOrderQuantity)
            .GreaterThan(0);

        RuleFor(x => x.MaxOrderQuantity)
            .GreaterThanOrEqualTo(x => x.MinOrderQuantity)
            .When(x => x.MaxOrderQuantity.HasValue);

        RuleFor(x => x.LeadTimeDays)
            .GreaterThanOrEqualTo(0)
            .When(x => x.LeadTimeDays.HasValue);

        RuleFor(x => x.BaseVatRate)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.WeightGrams)
            .GreaterThanOrEqualTo(0)
            .When(x => x.WeightGrams.HasValue);

        RuleFor(x => x.OriginCountry)
            .Length(2)
            .When(x => !string.IsNullOrWhiteSpace(x.OriginCountry));

        RuleFor(x => x.Translations)
            .NotEmpty();

        RuleForEach(x => x.Translations)
            .ChildRules(translation =>
            {
                translation.RuleFor(x => x.LanguageCode)
                    .NotEmpty()
                    .MaximumLength(10);

                translation.RuleFor(x => x.Name)
                    .NotEmpty()
                    .MaximumLength(200);

                translation.RuleFor(x => x.SeoTitle)
                    .MaximumLength(200);
            });

        RuleFor(x => x.Variants)
            .NotEmpty();

        RuleForEach(x => x.Variants)
            .ChildRules(variant =>
            {
                variant.RuleFor(x => x.Sku)
                    .NotEmpty()
                    .MaximumLength(100);

                variant.RuleFor(x => x.Barcode)
                    .MaximumLength(100);

                variant.RuleFor(x => x.PriceExclVat)
                    .GreaterThanOrEqualTo(0);

                variant.RuleFor(x => x.CompareAtPriceExclVat)
                    .GreaterThanOrEqualTo(0)
                    .When(x => x.CompareAtPriceExclVat.HasValue);

                variant.RuleFor(x => x.StockQuantity)
                    .GreaterThanOrEqualTo(0);

                variant.RuleFor(x => x.ReservedStockQuantity)
                    .GreaterThanOrEqualTo(0);
            });

        RuleForEach(x => x.Images)
            .ChildRules(image =>
            {
                image.RuleFor(x => x.Url)
                    .NotEmpty()
                    .MaximumLength(1000);

                image.RuleFor(x => x.AltText)
                    .MaximumLength(200);
            });

        RuleForEach(x => x.Attributes)
            .ChildRules(attribute =>
            {
                attribute.RuleFor(x => x.AttributeKey)
                    .NotEmpty()
                    .MaximumLength(100);

                attribute.RuleFor(x => x.AttributeValue)
                    .NotEmpty();

                attribute.RuleFor(x => x.LanguageCode)
                    .MaximumLength(10);
            });

        RuleFor(x => x)
            .Must(x => x.Translations.Select(t => t.LanguageCode.Trim().ToLowerInvariant()).Distinct().Count() == x.Translations.Count)
            .WithMessage("Translation languages must be unique.");

        RuleFor(x => x)
            .Must(x => x.Variants.Select(v => v.Sku.Trim().ToLowerInvariant()).Distinct().Count() == x.Variants.Count)
            .WithMessage("Variant SKUs must be unique.");

        RuleFor(x => x)
            .Must(x => x.Images.Count(image => image.IsMain) <= 1)
            .WithMessage("Only one main image is allowed.");
    }
}