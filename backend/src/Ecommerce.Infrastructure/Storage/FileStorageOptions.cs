namespace Ecommerce.Infrastructure.Storage;

public sealed class FileStorageOptions
{
    public string PublicBaseUrl { get; init; } = string.Empty;
    public string UploadRoot { get; init; } = "wwwroot/uploads";
}