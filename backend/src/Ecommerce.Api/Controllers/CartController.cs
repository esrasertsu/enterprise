using Ecommerce.Application.Carts;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/cart")]
public sealed class CartController : ControllerBase
{
    private readonly PublicCartService _publicCartService;

    public CartController(PublicCartService publicCartService)
    {
        _publicCartService = publicCartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(
        [FromQuery] string sessionId,
        [FromQuery] string? languageCode,
        CancellationToken cancellationToken)
    {
        try
        {
            var cart = await _publicCartService.GetAsync(sessionId, languageCode, cancellationToken);
            return Ok(cart);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItemAsync([FromBody] AddCartItemCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var cart = await _publicCartService.AddItemAsync(command, cancellationToken);
            return Ok(cart);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPatch("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItemAsync(
        Guid itemId,
        [FromBody] UpdateCartItemQuantityCommand command,
        CancellationToken cancellationToken)
    {
        try
        {
            var cart = await _publicCartService.UpdateItemQuantityAsync(command.SessionId, itemId, command, cancellationToken);
            return cart is null ? NotFound() : Ok(cart);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItemAsync(
        Guid itemId,
        [FromQuery] string sessionId,
        [FromQuery] string? languageCode,
        CancellationToken cancellationToken)
    {
        try
        {
            var cart = await _publicCartService.RemoveItemAsync(sessionId, itemId, languageCode, cancellationToken);
            return cart is null ? NotFound() : Ok(cart);
        }
        catch (InvalidOperationException exception)
        {
            return Problem(title: exception.Message, statusCode: StatusCodes.Status400BadRequest);
        }
    }
}