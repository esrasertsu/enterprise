using Ecommerce.Application.Abstractions.Notifications;
using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Application.Abstractions.Storage;
using Ecommerce.Application.Checkout;
using Ecommerce.Application.Orders;
using Ecommerce.Application.QuoteRequests;
using Ecommerce.Application.Products;
using Ecommerce.Application.Categories;
using Ecommerce.Application.Carts;
using Ecommerce.Infrastructure.Notifications;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Storage;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
builder.Services.AddScoped<IValidator<SubmitQuoteRequestCommand>, SubmitQuoteRequestCommandValidator>();
builder.Services.AddScoped<IValidator<UpsertAdminCategoryCommand>, UpsertAdminCategoryCommandValidator>();
builder.Services.AddScoped<IValidator<UpsertAdminProductCommand>, UpsertAdminProductCommandValidator>();
builder.Services.AddScoped<QuoteRequestSubmissionService>();
builder.Services.AddScoped<AdminQuoteRequestService>();
builder.Services.AddScoped<AdminOrderQueryService>();
builder.Services.AddScoped<AdminCategoryQueryService>();
builder.Services.AddScoped<AdminCategoryService>();
builder.Services.AddScoped<AdminCategoryImageService>();
builder.Services.AddScoped<PublicCategoryQueryService>();
builder.Services.AddScoped<PublicProductQueryService>();
builder.Services.AddScoped<PublicCartService>();
builder.Services.AddScoped<PublicCheckoutService>();
builder.Services.AddScoped<AdminProductService>();
builder.Services.AddScoped<AdminProductImageService>();
builder.Services.AddScoped<IAdminQuoteRequestNotifier, SmtpAdminQuoteRequestNotifier>();
builder.Services.AddScoped<IFileStorage, LocalFileStorage>();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseHttpsRedirection();

app.MapControllers();

app.Run();