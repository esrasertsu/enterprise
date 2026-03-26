using FluentValidation;

namespace Ecommerce.Application.Categories;

public sealed class UpsertAdminCategoryCommandValidator : AbstractValidator<UpsertAdminCategoryCommand>
{
    public UpsertAdminCategoryCommandValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(1000);

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

        RuleFor(x => x)
            .Must(x => x.Translations.Select(translation => translation.LanguageCode.Trim().ToLowerInvariant()).Distinct().Count() == x.Translations.Count)
            .WithMessage("Translation languages must be unique.");
    }
}