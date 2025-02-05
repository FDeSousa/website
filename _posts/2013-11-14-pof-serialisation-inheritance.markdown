---
title:  "Portable Object Format Serialisation With Inheritance"
tags:
  - java
  - software development
  - oracle coherence
excerpt_separator: "<!--excerpt-->"
classes: wide
---

An older article of mine, written about Portable Object Format, used in a past role for a project.

<!--excerpt-->

## Introduction

The basics of POF serialisation are covered enough across the internet, but this article tries to show what you can do about serialising objects while accounting for changeable inheritance structures.

As part of the previous sprint at work we began implementing versioned and evolvable serialised objects for our Oracle Coherence cache in Portable Object Format (POF), which is currently not used in an easily evolvable way.

This post is a bit of a brain dump on how we've implemented versioning, which somebody may find useful, since the documentation isn't always perfectly clear about some points meaning it's been a trial-and-error implementation.

Implementation of POF serialisation and making objects evolvable is all done in code and requires hard-coding of the index numbers to keep it compatible between versions and languages, which makes for a rather tedious few days of work. When your colleagues haven't written unit tests for some objects you're making evolvable, you don't have cache nodes to test on, and have multiple objects with deep inheritance models to adapt across multiple languages, it becomes an awful lot of fun to work on.

Before setting off I'm going to point out an excellent post by Shan He, which helped more than any other blog post, implementation example, or even the official documentation in understanding how to implement a solution. That post is occasionally quoted and paraphrased below, since it really illuminates some areas well alone.

## Simple Serialisation
There are two basic ways to serialise objects into POF, which involve either making the object self-serialisable or using a separate serialiser class. Each have some advantages and disadvantages as is to be expected. With either approach, implementing the Evolvable interface or extending AbstractEvolvable in the serialised object is practically essential, and provides the base for evolvable object serialisation.

If you're going for the self-serialisation route you implement the PortableObject interface (or the useful EvolvablePortableObject interface that simply combines Evolvable and PortableObject interfaces in one), using the method `readExternal(PofReader)` to deserialise an object from the PofReader, and using the method `writeExternal(PofWriter)` to serialise the object into the PofWriter.

For the separate serialiser, you write another class that implements PofSerializer, defining the method `serialize(PofWriter, Object)` to serialise to the PofWriter, and the method `deserialize(PofReader)` to deserialise from the PofReader.

### Modelling a Simplistic Bond
Let's have a look at a really basic example of both approaches, serialising a simple representation of a Bond.

#### Bond object definition
{% raw %}
```java
// Fields and their data types:
class Bond {
    /* Define the fields */
    long contractNumber;
    String currency;
    String counterparty;
    String instrument;
    String issuer;
    Date maturityDate;
    double principal;
    double coupon;
    double price;
}
```
{% endraw %}

### Simple Evolvable Portable Object Example
{% raw %}
```java
public class Bond extends AbstractEvolvable implements EvolvablePortableObject {
    /* Define object implementation version */
    public static final int IMPL_VERSION = 1;
    
    /* Define the indices of the serialised fields */
    public static final int CONTRACT_NUMBER_INDEX = 1;
    public static final int CURRENCY_INDEX = 2;
    public static final int COUNTERPARTY_INDEX = 3;
    public static final int INSTRUMENT_INDEX = 4;
    public static final int ISSUER_INDEX = 5;
    public static final int MATURITY_DATE_INDEX = 6;
    public static final int PRINCIPAL_INDEX = 7;
    public static final int COUPON_INDEX = 8;
    public static final int PRICE_INDEX = 9;
    
    /* Define the fields */
    private long contractNumber;
    private String currency;
    private String counterparty;
    private String instrument;
    private String issuer;
    private Date maturityDate;
    private double principal;
    private double coupon;
    private double price;

	/* Define no-args constructor and other constructors */
	public Bond() {
		super();
	}

	public Bond(long contractNumber, String currency, String counterparty, String instrument,
                String issuer, Date maturityDate, double principal, double coupon, double price) {
    	super();
    
    	this.contractNumber = contractNumber;
        this.currency = currency;
        this.counterparty = counterparty;
        this.instrument = instrument;
        this.issuer = issuer;
        this.maturityDate = maturityDate;
        this.principal = principal;
        this.coupon = coupon;
        this.price = price;
	}

	/* SNIP */

	/* Serialisation method */
    @Override    
    public void writeExternal(PofWriter writer) throws IOException {
    	writer.setVersionId(Math.max(getImplVersion(), getDataVersion()));
        /* Serialise ourselves in ascending index order */
        writer.writeLong(CONTRACT_NUMBER_INDEX, getContractNumber());
        /* Skipping rest of writes */
        writer.writeRemainder(getFutureData());
    }

    /* Deserialisation method */
    @Override
    public void readExternal(PofReader reader) throws IOException {
        setDataVersion(reader.getVersionId());
        /* Deserialise ourselves in ascending index order */
        setContractNumber(reader.readLong(CONTRACT_NUMBER_INDEX));
        /* Skipping rest of reads */
        setFutureData(reader.readRemainder());
    }
    
    /* Return the constant implementation version */
    @Override
    public int getImplVersion() {
    	return IMPL_VERSION;
    }
}
```
{% endraw %}

If you prefer not to break the single responsibility principle, and consider a class taking care of its own serialisation a breach of that principle, this is not the method for you. The one below will likely make more sense.

### Simple Evolvable Object Serialiser Example

#### Object
For this example, we keep just the object's fields and methods, implement just Evolvable by extending AbstractEvolvable, and remove the serialisation code.

{% raw %}
```java
public class Bond extends AbstractEvolvable {
    /* Define object implementation version */
    public static final int IMPL_VERSION = 1;

    /* Define the fields */
    private long contractNumber;
    private String currency;
    private String counterparty;
    private String instrument;
    private String issuer;
    private Date maturityDate;
    private double principal;
    private double coupon;
    private double price;
    
    /* Define no-args constructor and other constructors */
    public Bond() {
    	super();
    }

    public Bond(long contractNumber, String currency, String counterparty, String instrument,
                String issuer, Date maturityDate, double principal, double coupon, double price) {
    	super();

        this.contractNumber = contractNumber;
        this.currency = currency;
        this.counterparty = counterparty;
        this.instrument = instrument;
        this.issuer = issuer;
        this.maturityDate = maturityDate;
        this.principal = principal;
        this.coupon = coupon;
        this.price = price;
    }

    /* SNIP */

    /* Return the constant implementation version */
    @Override
    public int getImplVersion() {
    	return IMPL_VERSION;
    }
}
```
{% endraw %}

#### Serialiser
The serialisation code and field indices are now in the serialiser class, which does the heavy lifting on serialising and deserialising the class.

{% raw %}
```java
public class BondSerializer implements PofSerializer {
    /* Define indices for the serialised fields */
    public static final int CONTRACT_NUMBER_INDEX = 1;
    public static final int CURRENCY_INDEX = 2;
    public static final int COUNTERPARTY_INDEX = 3;
    public static final int INSTRUMENT_INDEX = 4;
    public static final int ISSUER_INDEX = 5;
    public static final int MATURITY_DATE_INDEX = 6;
    public static final int PRINCIPAL_INDEX = 7;
    public static final int COUPON_INDEX = 8;
    public static final int PRICE_INDEX = 9;

    /* Serialise the object into the writer */
    public void serialize(PofWriter writer, Object o) throws IOException {
    	/* Check Object is of correct type to serialize */
    	if (!(o instanceof Bond)) {
    		// Handle the case of an invalid/null object
    	}

        Bond bond = (Bond) o;        
        writer.setVersionId(Math.max(bond.getImplVersion(), bond.getDataVersion()));
        /* Serialise ourselves in ascending index order */
        writer.writeLong(CONTRACT_NUMBER_INDEX, bond.getContractNumber());
        /* Skipping rest of writes */
        writer.writeRemainder(bond.getFutureData());
    }

    /* Deserialise from the reader into a new object */
    public Object deserialize(PofReader reader) throws IOException {
        /* Instantiate a new Bond to deserialise into */
        Bond bond = new Bond();
        bond.setDataVersion(reader.getVersionId());
    
        /* Deserialise ourselves in ascending index order */
        bond.setContractNumber(reader.readLong(CONTRACT_NUMBER_INDEX));
        
        /* Skipping rest of reads */
        bond.setFutureData(reader.readRemainder());
    }
}
```
{% endraw %}

It is just more of the same, a case of defining the serialisation outside of the class instead of part of it, with both forms of serialisation displayed above being suitable for our current object hierarchy of one.

For the above examples a simple Bond contract was implemented, but what if we want to model a Future? Do we really need to re-implement all of the useful fields that apply to both? Of course not, we abstract things!

## Serialisation and Inheritance
In POF serialisation there are three important attributes for evolvable objects, implementation version, data version and future data. Future data is a record of any data we may not be able to process because it's from a newer implementation, and the version numbers define what version data being serialised or deserialised is, and also what it should contain.

By extending AbstractEvolvable, the storage of data version and future data is taken care of. The object must define its own `getImplVersion()` method returning the implementation version. Whether implementing PortableObject, or defining a separate PofSerializer, the base has been established.

What happens when you inherit from an evolvable object?

As stated above, to make objects backwards- and forwards-compatible and allow evolution, POF serialisation uses implementation version, data version and future data, which are stored in the object. When you are serialising a class with super-classes that require serialisation, where do you get the version number from, and what happens when adding new fields? The documentation does not clarify the situation, so below is my interpretation of what should happen.

Implementation version defines the version of the implementation of the object. Every time a serialisable attribute is changed in the object this version number should increase, since this number will also define the version number of data constructed by this implementation. The Evolvable interface defines the function `getImplVersion()` which is expected to return the version number of the object's implementation. Its use is related to the data version, explained below.

Data version defines the version of the data being serialised or deserialised. If the object has just been instantiated the data version will be the same as the implementation version, but if it's been previously deserialised the data could have come from a future implementation. This is why you see the call to `Math.max(getImplVersion(), getDataVersion())` in the examples when calling `PofWriter.setVersionId()`, so we always define the latest version suitable for the data.

Future data is held in a Binary object, and is read via `PofReader.readRemainder()`, which does what it says on the tin, reading any remaining data we haven't read. If deserialising from a newer implementation version, we might have some remaining data that should be kept in case we must serialise the same object again. As mentioned above, this is why we keep a copy of the data version around, and call `setVersionId(Math.max(getImplVersion(), getDataVersion()))` to set the version to the latest one.

As each layer should have its own implementation version, it should also hold onto its own data version and future data. This means AbstractEvolvable should not be extended, instead (re)implementing Evolvable at each level with private versions and data members. PortableObject also requires (re)implementation at each level, with sub-classes calling their super-class methods with a nested POF reader when deserialising, or writer when serialising. There's a fair portion of code being copied around, but it's a necessary evil to have the implementation we want.

Solutions that account for inheritance using the afore-mentioned nested readers and writers have great flexibility. Due to the nesting implementation, each class can have index numbers without clashes. Sub-classes can be added to the inheritance structure without changing the serialisation or implementation of a super-class. Super-classes are none-the-wiser that they're not the top-level serialised objects. The greatest benefit of all, is that a new serialised attribute of a super-class can be shared to all sub-classes, with no changes to their own serialisation. Most articles and posts don't detail this implementation, avoiding the subject due to not knowing its intent or use, or because they were written before it was available in the API.

POF serialisation becomes a bit tedious once you've a large enough class, as you write much the same code over and over. After declaring a new field, write the getter and setter methods, add a new index for the field to be serialised and deserialised at, increment the implementation version, and add the lines to serialise and deserialise the field. That's the very basics of it, and if you have to add thirty fields, you must follow those steps thirty times. Imagine the extreme tedium of serialising classes five levels deep.

## Modelling Bonds and Futures Contracts
We're extending the modelled objects further to give us possibility for some new examples, adding Futures contracts to the system, which share a number of base attributes with Bonds contracts. First, defining what goes into each layer.

### Contract Base
{% raw %}
```java
// Fields and their data types:
class Contract {
    /* Define the fields */
    long contractNumber;
    String currency;
    String counterparty;
    String broker;
    double price;
}
```
{% endraw %}

The fields defined above would have been found in both a Bond and a Future contract, but note the addition of the Broker field to the contract base so a Bond can have a Broker assigned to it as well as a Future.

### Bond Contract
{% raw %}
```java
// Fields and their data types:
class Bond : Contract {
    /* Define the fields */
    String issuer;
    Date maturityDate;
    double principal;
    double price;
}
```
{% endraw %}

We're keeping the above fields specifically only for Bonds, since they're not relevant for all of the products we want to implement. The fields in the base were previously held exclusively in Bond, but they've now been abstracted out, as seen in the definition of Contract above.

### Future Contract
{% raw %}
```java
// Fields and their data types:
class Future : Contract {
    /* Define the fields */
    String contract;
    String tenorCode;
    long lots;
}
```
{% endraw %}

To make a basic Future contract we only need a few attributes, so this looks rather minimal and with good reason. Everything else we currently absolutely require is held in the base.

## Evolvable Portable Objects with Inheritance Example

### Contract

We're making the Contract evolvable, and self-serialisable so that it may hold its own data version, implementation version and future data without clashes with sub-classes replacing them. As it's able to be abstract, we'll take advantage of that to ignore implementations of part of the Evolvable interface. Otherwise, this is very similar to the original Bond serialisation example.
{% raw %}
```java
public abstract class Contract implements EvolvablePortableObject {
    /* Define object implementation version */
    public static final int IMPL_VERSION = 1;

    /* Define the indices of the serialised fields */
    // Superclass index should be the same in all sub-classes
    public static final int SUPERCLASS_INDEX = 0;
    public static final int CONTRACT_NUMBER_INDEX = 1;
    public static final int CURRENCY_INDEX = 2;
    public static final int COUNTERPARTY_INDEX = 3;
    public static final int BROKER_INDEX = 4;
    public static final int PRICE_INDEX = 5;

    /* Define serialisation-specific fields */
    private int dataVersion;
    private Binary futureData;

    /* Define the fields */
    private long contractNumber;
    private String currency;
    private String counterparty;
    private String broker;
    private double price;

    /* Define no-args constructor and any others */
    protected Contract() {
    	// Nothing to do here, no super(), nothing...
    }

    protected Contract(long contractNumber, String currency, String counterparty, String broker, double price) {
        this.contractNumber = contractNumber;
        this.currency = currency;
        this.counterparty = counterparty;
        this.broker = broker;
        this.price = price;
    }

    /* SNIP */

    /* Serialisation method */
    @Override
    public void writeExternal(PofWriter writer) throws IOException {
    	writer.setVersionId(Math.max(IMPL_VERSION, dataVersion));
    	/* Serialise ourselves in ascending index order */
    	writer.writeLong(CONTRACT_NUMBER_INDEX, getContractNumber());
    	/* Skipping rest of writes */
    	writer.writeRemainder(futureData);
    }

    /* Deserialisation method */
    @Override public void readExternal(PofReader reader) throws IOException {
    	dataVersion = reader.getVersionId();
    	/* Deserialise ourselves in ascending index order */
    	setContractNumber(reader.readLong(CONTRACT_NUMBER_INDEX));
    	/* Skipping rest of reads */
    	futureData = reader.readRemainder();
    }
}
```
{% endraw %}

### Bond
The first, and most important, thing to note are the calls to `PofWriter.createNestedPofWriter()` and `PofReader.createNestedPofReader()`, which will allow serialising and deserialising to and from a numbered field, without the object being handed the reader/writer instance knowing there's a difference. This is how we handle serialisation of our superclasses, by giving it a nested reader/writer, always using field number zero.
{% raw %}
```java
public class Bond extends Contract {
    /* Define object implementation version
       This can differ from Contract Base */
    public static final int IMPL_VERSION = 1;
    
    /* Define the indices of the serialised fields
       You can use same indices as super-class */
    public static final int INSTRUMENT_INDEX = 1;
    public static final int ISSUER_INDEX = 2;
    public static final int MATURITY_DATE_INDEX = 3;
    public static final int PRINCIPAL_INDEX = 4;
    public static final int COUPON_INDEX = 5;
    
    /* Define serialisation-specific fields */
    private int dataVersion;
    private Binary futureData;
    
    /* Define the fields */
    private String instrument;
    private String issuer;
    private Date maturityDate;
    private double principal;
    private double coupon;
    
    /* Define no-args constructor and any others */
    public Bond() {
    	super();
    }
    
    public Bond(long contractNumber, String currency, String counterparty, String broker, double price, String instrument, String issuer, Date maturityDate, double principal, double coupon) {
        super(contractNumber, currency, counterparty, broker, price);
        this.instrument = instrument;
        this.issuer = issuer;
        this.maturityDate = maturityDate;
        this.principal = principal;
        this.coupon = coupon;
    }
    
    /* SNIP */
    
    /* Return the constant implementation version */
    
    /* Serialisation method */
    @Override
    public void writeExternal(PofWriter writer) throws IOException {
        writer.setVersionId(Math.max(IMPL_VERSION, dataVersion));
        /* Serialise superclass first using nested writer */
        PofWriter subWriter = writer.createNestedPofWriter(SUPERCLASS_INDEX);
        super.writeExternal(subWriter);
        /* Serialise ourselves in ascending index order */
        writer.writeString(INSTRUMENT_INDEX, getInstrument());
        /* Skipping rest of writes */
        writer.writeRemainder(futureData);
    }
    
    /* Deserialisation method */
    @Override
    public void readExternal(PofReader reader) throws IOException {
        dataVersion = reader.getVersionId();
        /* Deserialise superclass first using nested reader */
        PofReader subReader = reader.createNestedPofReader(SUPERCLASS_INDEX);
        super.readExternal(subReader);
        /* Deserialise ourselves in ascending index order */
        setInstrument(reader.readString(INSTRUMENT_INDEX));
        /* Skipping rest of reads */
        futureData = reader.readRemainder();
    }
    
    /* Evolvable implementation */
    @Override
    public int getImplVersion() {
    	return IMPL_VERSION;
    }
    
    @Override
    public int getDataVersion() {
    	return dataVersion;
    }
    
    @Override
    public void setDataVersion(int dataVersion) {
    	this.dataVersion = dataVersion;
    }
    
    @Override
    public Binary getFutureData() {
    	return futureData;
    }
    
    @Override
    public void setFutureData(Binary futureData) {
    	this.futureData = futureData;
    }
}
```
{% endraw %}

### Future
This has the same structure as the Bond class, with differences in the fields used, so it's nothing exciting.

{% raw %}
```java
public class Future extends Contract {
    /* Define object implementation version
       This can differ from Contract Base */
    public static final int IMPL_VERSION = 1;

    /* Define the indices of the serialised fields
       You can use same indices as super-class */
    public static final int CONTRACT_INDEX = 1;
    public static final int TENOR_CODE_INDEX = 2;
    public static final int LOTS_INDEX = 3;

    /* Define serialisation-specific fields */
    private int dataVersion;
    private Binary futureData;

    /* Define the fields */
    private String contract;
    private String tenorCode;
    private double lots;
    
    /* Define no-args constructor and any others */
    public Future() {
    	super();
    }

    public Future(long contractNumber, String currency, String counterparty, String broker, double price, String contract, String tenorCode, double lots) {
        super(contractNumber, currency, counterparty, broker, price);
        this.contract = contract;
        this.tenorCode = tenorCode;
        this.lots = lots;
    }

    /* SNIP */

    /* Serialisation method */
    @Override
    public void writeExternal(PofWriter writer) throws IOException {
        writer.setVersionId(Math.max(IMPL_VERSION, dataVersion));

        /* Serialise superclass first using nested writer */
        PofWriter subWriter = writer.createNestedPofWriter(SUPERCLASS_INDEX);
        super.writeExternal(subWriter);

        /* Serialise ourselves in ascending index order */
        writer.writeString(CONTRACT_INDEX, getContract());
        /* Skipping rest of writes */
        writer.writeRemainder(futureData);
    }

    /* Deserialisation method */
    @Override
    public void readExternal(PofReader reader) throws IOException {
        dataVersion = reader.getVersionId();

        /* Deserialise superclass first using nested reader */
        PofReader subReader = reader.createNestedPofReader(SUPERCLASS_INDEX);
        super.readExternal(subReader);

        /* Deserialise ourselves in ascending index order */
        setContract(reader.readString(CONTRACT_INDEX));
        /* Skipping rest of reads */
        futureData = reader.readRemainder();
    }

    /* Evolvable implementation */
    @Override
    public int getImplVersion() {
    	return IMPL_VERSION;
    }

    @Override
    public int getDataVersion() {
    	return dataVersion;
    }

    @Override
    public void setDataVersion(int dataVersion) {
    	this.dataVersion = dataVersion;
    }

    @Override
    public Binary getFutureData() {
    	return futureData;
    }

    @Override
    public void setFutureData(Binary futureData) {
    	this.futureData = futureData;
    }
}
```
{% endraw %}

## Alternatives
The above can be inelegant and messy. Here are some alternatives you might want to check out.

### Don't break the single-responsibility principle!
"How about if I'm trying not to break the single-responsibility principle?"

Easy, reflection can help you, and to be more specific [Alexey Ragozin's open-source ReflectionPofSerializer](https://code.google.com/p/gridkit/wiki/ReflectionPofSerializer) can do this for you. [Read about the implementation right here on Grid Dynamics' blog](http://blog.griddynamics.com/2009/09/oracle-coherence-using-pof-without.html).

### Interface inheritance over implementation inheritance
Is inheritance really all that important? [Considering some people consider extends to be evil](http://www.javaworld.com/javaworld/jw-08-2003/jw-0801-toolbox.html), even James Gosling, creator of Java, should we really be pushing to use it when it makes the job more difficult? Not only does Oracle seemingly discourage it with their implementation of POF serialization, but [Google's Protocol Buffers](https://code.google.com/p/protobuf/) prefers nesting of messages rather than using an inheritance model.

Having learned ever since sixth form programming lectures that I should use inheritance all the time (they were a little extreme), it's a big change to my normal thought processes. I can certainly see the advantages of solutions that use nested objects (matching the POF serialization model), over inheritance when using Coherence to store objects.

Overall this might be considered the better approach when you are given free-reign to refactor, or are writing from the ground up. With nested or separately defined objects you're free to either implement a PofSerializer for each object, or make them PortableObjects as you wish, without as much of the hassle.

Having learned ever since sixth form programming lectures that I should use inheritance all the time (they were a little extreme), it's a big change to my normal thought processes. Overall this might be considered the better approach when you are given free-reign to refactor, or are writing from the ground up. With nested or separately defined objects you're free to either implement a PofSerializer for each object, or make them PortableObjects as you wish.

For backwards compatibility a newer implementation version should provide suitable defaults for attributes missing from older data, and the wholeness of data should be kept for the benefit of older versions.

For forwards compatibility an older implementation version should keep the wholeness of the serialised data even for parts not recognised by the implementation.

Using `setFutureData(reader.readRemainder())` in deserialisers and `writer.writeRemainder(getFutureData())` in serialisers achieves the above by simply holding onto any future data, and handing it over where necessary.

For backwards compatibility a newer implementation version should provide suitable defaults for attributes missing from older data, and the wholeness of data should be kept for the benefit of older versions. For forwards compatibility an older implementation version should keep the wholeness of the serialised data even for parts not recognised by the implementation. Using `setFutureData(reader.readRemainder())` in deserialisers and `writer.writeRemainder(getFutureData())` in serialisers achieves the above by simply holding onto any future data, and handing it over where necessary.

Implementation version should increase with each change to the implementation. Data versions of serialised objects should always be the higher of the current implementation version or the previous data version, whichever is the greater; `writer.setDataVersion(Math.max(getImplVersion(), getDataVersion())` is used in serialiser methods for this very purpose.

As POF serialisation expects to write data in increasing index numbers, and read that data back in the same order, we should add fields in increasing index number order.

Since we will only ever add to serialised objects, we should never go back on index numbers or change the usage of an index number. If the type of a serialised field changes, so should its associated index number.

As POF serialisation expects to write data in increasing index numbers, and read that data back in the same order, we should add fields in increasing index number order. Since we will only ever add to serialised objects, we should never go back on index numbers or change the usage of an index number. If the type of a serialised field changes, so should its associated index number.

The majority of serialisation unit tests will revolve around making certain the right calls are made to the right methods, and they're done the right number of times. This is where a good mocking framework should be employed to mock up PofReaders and PofWriters to your heart's content. Add a few calls to `Assert.assertEquals(expected, actual)` to be absolutely certain nothing odd has occurred, and you're golden.

When testing that your objects serialise and deserialise correctly under normal circumstances, you need to use an ExternalizableHelper and a PofContext. You register your user types to the PofContext, and use the ExternalizableHelper to serialise and deserialise your object type.

It's much easier to show an example than to explain how to use ExternalizableHelper and PofContext in conjunction.

{% raw %}
```java
@Test
public void testBondSerialisationDeserialisation() {
    /* Register serialisable user types required to
       serialise your object */
    SimplePofContext pofContext = new SimplePofContext();
    pofContext.registerUserType(1001, Bond.class, new PortableObjectSerializer(1001));

    /* Make sure you have whatever object you want to
       test serialisation on */
    Bond original = new Bond(123, "EUR", "ABC", "DEF", 100.0, "GHI", "JKL", new Date(456789), 800.0, 9.0);

    /* Use ExternalizableHelper.toBinary to serialise
       your object to Binary */
    Binary bin = ExternalizableHelper.toBinary(original, pofContext);

    /* Use ExternalizableHelper.fromBinary to deserialise
       object from Binary */
    Object obj = ExternalizableHelper.fromBinary(bin, pofContext);

    // Now do your tests - some simple examples
    assertTrue(obj instanceof Bond);
    Bond copy = (Bond) obj;
    assertEquals(original, copy);

    // Good idea to do your own checks of individual members
}
```
{% endraw %}

The test is rather simple, and easy to add to. We don't want to test that the PofSerializer, PofContext or ExternalizableHelper work, or that the Binary format is valid. Rather, we're only interested in making sure our object is correctly serialised and deserialised, and the resulting object is equivalent to the original.

One thing you should probably not test is the byte array values of serialised objects. You can test using byte arrays via the `ExternalizableHelper.toByteArray()` and `ExternalizableHelper.fromByteArray()` functions, but you probably shouldn't. It wastes your time whenever there is a change to a serialised object, having to manually edit the byte arrays to change the expected data. Only if you rely upon the byte array values should you be testing against them.

Testing serialisation code's use of the PofReader and PofWriter is rather easy using a good mocking framework, since they're both interfaces. You could even test the nesting, making sure your code uses the correct reader and writer for each serialised object, and the sequence in which fields are serialised or deserialised, as in this example.

{% raw %}
```java
@RunWith(JMock.class)
public class FutureTest {
    Mockery context = new JUnit4Mockery();

    // Setup mocks for PofWriter tests
    @Mock PofWriter writer;
    @Mock PofWriter subWriter;

    // Setup mocks for PofReader tests
    @Mock PofReader reader;
    @Mock PofReader subReader;

    // Setup sequence - only one needed
    @Auto Sequence sequence;

    // Define some test data e.g.:
    // Contract
    private final long contractNumber = 1234567890;
    // Future
    private final String contract = "ABCD";

    @Test
    public void testFutureSerialisation() {
        context.checking(new Expectations() {{
        	// Invocations in Future
        	oneOf(writer).setVersionId(Future.IMPL_VERSION);
        	inSequence(sequence);
        	oneOf(writer).createNestedPofWriter(Future.SUPERCLASS_INDEX);
        	inSequence(sequence);
        	will(returnValue(subWriter));

        	// Invocations in Contract
        	oneOf(subWriter).setVersionId(Contract.IMPL_VERSION);
        	inSequence(sequence);
        	oneOf(subWriter).writeLong(Contract.CONTRACT_NUMBER_INDEX, contractNumber);
        	inSequence(sequence);

        	// Write rest of serialised fields
        	oneOf(subWriter).writeRemainder(aNull(Binary.class));
        	inSequence(sequence);

        	// Continue invocations in Future
        	oneOf(writer).writeString(Future.CONTRACT_INDEX, contract);
        	inSequence(sequence);

        	// Write rest of serialised fields
        	oneOf(writer).writeRemainder(aNull(Binary.class));
        	inSequence(sequence);
        }});

        // Instantiate object to serialise using test data
        Future future = new Future(contractNumber, currency, counterparty, broker, price, contract, tenorCode, lots);

        // Serialise to check the expectations are correct
        future.writeExternal(writer);
    }

    @Test
    public void testFutureDeserialisation() {
        context.checking(new Exceptions() {{
            // Invocations in Future
            oneOf(reader).getVersionId();
            inSequence(sequence);
            will(returnValue(Future.IMPL_VERSION));
            oneOf(reader).createNestedPofReader(Future.SUPERCLASS_INDEX);
            inSequence(sequence);
            will(returnValue(subReader));

            // Invocations in Contract
            oneOf(subReader).getVersionId();
            inSequence(sequence);
            will(returnValue(Contract.IMPL_VERSION));
            oneOf(subReader).readLong(Contract.CONTRACT_NUMBER_INDEX);
            inSequence(sequence);
            will(returnValue(contractNumber));

            // Read rest of serialised fields
            oneOf(subReader).readRemainder();
            inSequence(sequence);
            will(returnValue(null));

            // Continue invocations in Future
            oneOf(reader).readString(Future.CONTRACT_INDEX);
            inSequence(sequence);
            will(returnValue(contract));

            // Write rest of serialised fields
            oneOf(reader).readRemainder();
            inSequence(sequence);
            will(returnValue(null));
        }});

        // Instantiate Future object with default constructor to deserialise
        Future future = new Future();

        // Deserialise to check the expectations are correct
        future.readExternal(reader);

        // Check data is the same as expected with asserts
        assertEquals(contractNumber, future.getContractNumber());
        assertEquals(contract, future.getContract());

        // Skipping rest of asserts
    }
}
```
{% endraw %}

Shan He touches on testing serialisation in his post, and suggests creating two projects to test with. One project would contain the older implementation, the other project containing the newer implementation. The two then transfer serialised objects checking they serialise and deserialise correctly between the versions in test.
When upgrading a Coherence cluster, nodes can be brought down one at a time, upgraded and brought back up.
To test the case of an old version node passing an object to a new version, the old implementation constructs an object, serialises and passes it to the new implementation. The new implementation would deserialise, re-serialise and return the object. The old implementation deserialises and checks its equality.
To test the case of a new version node passing an object to an old version, just swap the roles and have the new implementation construct the object at the start, and check the object at the end.

The process of making a class serialisable in Portable Object Format is not complicated, but can be tedious. There can be a large amount of duplicate code, making potential for errors higher, but if both the super- and sub-classes being serialised can evolve, that duplication can be the only way to implement a solution. Hopefully this post has helped in figuring out what's needed for a working implementation in other systems.

Shan He, 27 June 2011. Understanding the evolvable POF objects in Coherence. Shanhe.me
[http://shanhe.me/2011/06/27/understanding-the-evolvable-pof-objects-in-coherence](http://shanhe.me/2011/06/27/understanding-the-evolvable-pof-objects-in-coherence)

Alexey Ragozin, 18 September 2009. Oracle Coherence using POF, without a single line of code. Blog.GridDynamics.com
[http://blog.griddynamics.com/2009/09/oracle-coherence-using-pof-without.html](http://blog.griddynamics.com/2009/09/oracle-coherence-using-pof-without.html)

Allen Holub, 1 August 2003. Why extends is evil. JavaWorld.com
[http://www.javaworld.com/javaworld/jw-08-2003/jw-0801-toolbox.html](http://www.javaworld.com/javaworld/jw-08-2003/jw-0801-toolbox.html)
