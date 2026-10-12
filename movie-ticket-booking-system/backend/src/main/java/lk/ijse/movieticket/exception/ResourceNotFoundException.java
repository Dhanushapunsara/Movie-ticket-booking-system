package lk.ijse.movieticket.exception;

/** -> 404 Not Found */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found with id: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
