namespace Ecommerce.Application.Abstractions.Storage;

public sealed class FileStorageUpload
{
    public required string OriginalFileName { get; init; }
    public required string ContentType { get; init; }
    public required Stream Content { get; init; }
    public required long Length { get; init; }
}