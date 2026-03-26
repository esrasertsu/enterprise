using Ecommerce.Application.Checkout;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/checkout")]
public sealed class CheckoutController : ControllerBase
{
    private readonly PublicCheckoutService _publicCheckoutService;

    public CheckoutController(PublicCheckoutService publicCheckoutService)
    {
        _publicCheckoutService = publicCheckoutService;
    }

    [HttpPost("preview")]
    public async Task<IActionResult> PreviewAsync([FromBody] CheckoutPreviewCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var checkout = await _publicCheckoutService.PreviewAsync(command, cancellationToken);
            return Ok(checkout);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrderAsync([FromBody] CreateOrderFromCheckoutCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var order = await _publicCheckoutService.CreateOrderAsync(command, cancellationToken);
            return Created($"/api/orders/{order.OrderNumber}", order);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
        catch (DbUpdateException)
        {
            return Problem(title: "Order could not be created at this time.", statusCode: StatusCodes.Status409Conflict);
        }
    }
}