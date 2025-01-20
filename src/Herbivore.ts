import Blob from './Blob';
import { BlobTypes } from './interfaces';

class Herbivore extends Blob {
  constructor(...args: ConstructorParameters<typeof Blob>) {
    super(...args);
    this.loadModel(BlobTypes.HERBIVORE);
  }
}

export default Herbivore;
