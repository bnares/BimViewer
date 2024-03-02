using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection.Metadata.Ecma335;

namespace BIMViewer.Entities
{
    public class Model
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }

        [Required(AllowEmptyStrings =true), DisplayFormat(ConvertEmptyStringToNull =false)]
        public string? FileName { get; set; }

        [NotMapped]
        public IFormFile File { get; set; }

        [NotMapped]
        public string  FileSrc { get; set; }

        public string ModelProperties { get; set; }



    }
}
