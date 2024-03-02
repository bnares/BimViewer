using System.ComponentModel.DataAnnotations.Schema;

namespace BIMViewer.DTO
{
    public class ModelDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }

        [NotMapped]
        public IFormFile File { get; set; }
        [NotMapped]
        
        public string FileSrc { get; set; }

        public string ModelProperties { get; set; } = "Testowa wiadomosc";

    }
}
