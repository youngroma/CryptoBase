# Generated by Django 5.1.7 on 2025-05-24 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='portfoliotransaction',
            name='symbol',
        ),
        migrations.AddField(
            model_name='portfoliotransaction',
            name='fee',
            field=models.DecimalField(blank=True, decimal_places=8, max_digits=20, null=True),
        ),
        migrations.AlterField(
            model_name='portfoliotransaction',
            name='type',
            field=models.CharField(choices=[('buy', 'Buy'), ('sell', 'Sell'), ('transfer', 'Transfer')], max_length=8),
        ),
    ]
