import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from './repository.service';

type Model = { name: string; id: string; type: string };

@Component({
  selector: 'app-back-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './back-test.component.html',
  styleUrl: './back-test.component.scss',
})
export class BackTestComponent {
  client = inject(ClientService);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group<{ name: string; id: string; type: string }>({
    name: '',
    id: '',
    type: '',
  });

  person = this.client.select<Model>('person');
  car = this.client.select$('car');
  dvir = this.client.select('dvir');
  constructor() {
    // this.client.polling.start('person');

    // setTimeout(() => {
    //   console.log('this.client.polling.stop(person)');
    //   this.client.polling.stop('person');
    // }, 3100);
    // setTimeout(() => {
    //   console.log('this.client.polling.start(person)');
    //   this.client.polling.start('person');
    // }, 10000);
    // setTimeout(() => {
    //   console.log('this.client.polling.stop');
    //   this.client.polling.stop();
    // }, 20000);

    effect(() => {
      console.log(this.person());
    });
  }

  //#region crud
  onGetAll() {
    this.client.getAll(this.form.value.type!).subscribe((x) => console.log(x));
  }
  onAddOne() {
    const data = this.form.getRawValue();
    this.client.addOne(data).subscribe((x) => console.log(x));
  }
  onUpdateOne() {
    const data = this.form.getRawValue();
    // this.client.updateOne(data).subscribe((x) => console.log(x));
    this.client.updateEntity(data);
  }
  onUpdateMANY() {
    const type = this.form.value.type ?? 'person';
    const data = this.client.select<Model>(type);
    data().forEach((x) => {
      x.name = x.name.split('-')[0];
    });
    this.client.updateEntity(data()); //.subscribe((x) => console.log(x));
  }
  onDeleteOne() {
    const data = this.form.getRawValue();
    this.client.deleteOne(data).subscribe((x) => console.log(x));
  }
  onDelete(item: any) {
    this.client.deleteOne(item).subscribe((x) => console.log(x));
  }
  onDeleteAll() {
    this.client.deleteAll('person').subscribe((x) => console.log(x));
  }
  //#endregion
}
