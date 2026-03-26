using Ecommerce.Application.QuoteRequests;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/quote-requests")]
public sealed class QuoteRequestsController : ControllerBase
{
    private readonly QuoteRequestSubmissionService _quoteRequestSubmissionService;

    public QuoteRequestsController(QuoteRequestSubmissionService quoteRequestSubmissionService)
    {
        _quoteRequestSubmissionService = quoteRequestSubmissionService;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitAsync(
        [FromBody] SubmitQuoteRequestCommand command,
        CancellationToken cancellationToken)
    {
        try
        {
            var quoteRequestId = await _quoteRequestSubmissionService.SubmitAsync(command, cancellationToken);
            return Accepted(new { id = quoteRequestId, message = "Quote request submitted successfully." });
        }
        catch (ValidationException exception)
        {
            return ValidationProblem(new ValidationProblemDetails(exception.Errors
                .GroupBy(error => error.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.ErrorMessage).ToArray())));
        }
    }
}