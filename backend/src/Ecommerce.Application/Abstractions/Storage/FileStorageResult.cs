namespace Ecommerce.Application.Abstractions.Storage;

public sealed record FileStorageResult(
    string Url,
    string StoredFileName,
    long FileSize,
    string ContentType);